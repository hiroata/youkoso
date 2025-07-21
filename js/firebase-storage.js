// Firebase Storage Integration for Product Images
class FirebaseStorageManager {
    constructor() {
        this.storage = null;
        this.database = null;
        this.initialized = false;
    }

    // Initialize Firebase Storage
    async init() {
        if (this.initialized) return;
        
        try {
            // Get Firebase instances
            if (typeof firebase !== 'undefined') {
                this.storage = firebase.storage();
                this.database = firebase.database();
                this.initialized = true;
                console.log('Firebase Storage initialized successfully');
            } else {
                console.error('Firebase not loaded. Please include Firebase SDK.');
            }
        } catch (error) {
            console.error('Error initializing Firebase Storage:', error);
        }
    }

    // Upload product image to Firebase Storage
    async uploadProductImage(file, productId) {
        if (!this.initialized) await this.init();
        if (!this.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        try {
            // Create a storage reference
            const timestamp = Date.now();
            const fileName = `${productId}_${timestamp}_${file.name}`;
            const storageRef = this.storage.ref(`products/${fileName}`);

            // Upload file
            console.log(`Uploading ${fileName}...`);
            const uploadTask = storageRef.put(file);

            // Monitor upload progress
            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Progress
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`Upload progress: ${progress.toFixed(2)}%`);
                        
                        // Dispatch custom event for UI updates
                        window.dispatchEvent(new CustomEvent('upload-progress', {
                            detail: { productId, progress }
                        }));
                    },
                    (error) => {
                        // Error
                        console.error('Upload error:', error);
                        reject(error);
                    },
                    async () => {
                        // Complete
                        try {
                            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                            console.log('File uploaded successfully:', downloadURL);
                            
                            // Save URL to database
                            await this.saveImageUrlToDatabase(productId, downloadURL);
                            
                            resolve({
                                url: downloadURL,
                                fileName: fileName,
                                size: file.size,
                                type: file.type
                            });
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    // Delete product image from Firebase Storage
    async deleteProductImage(imageUrl) {
        if (!this.initialized) await this.init();
        if (!this.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        try {
            // Create a reference from URL
            const storageRef = this.storage.refFromURL(imageUrl);
            
            // Delete the file
            await storageRef.delete();
            console.log('Image deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }

    // Save image URL to Realtime Database
    async saveImageUrlToDatabase(productId, imageUrl) {
        if (!this.database) {
            console.warn('Database not initialized, saving to localStorage instead');
            this.saveToLocalStorage(productId, imageUrl);
            return;
        }

        try {
            await this.database.ref(`products/${productId}/image`).set(imageUrl);
            console.log('Image URL saved to database');
        } catch (error) {
            console.error('Error saving to database:', error);
            // Fallback to localStorage
            this.saveToLocalStorage(productId, imageUrl);
        }
    }

    // Fallback: Save to localStorage
    saveToLocalStorage(productId, imageUrl) {
        const products = JSON.parse(localStorage.getItem('adminProductsBackup') || '{"products":[]}');
        const product = products.products.find(p => p.id === productId);
        
        if (product) {
            product.image = imageUrl;
            localStorage.setItem('adminProductsBackup', JSON.stringify(products));
            console.log('Image URL saved to localStorage');
        }
    }

    // Get all product images from a folder
    async listProductImages() {
        if (!this.initialized) await this.init();
        if (!this.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        try {
            const listRef = this.storage.ref('products');
            const result = await listRef.listAll();
            
            const images = [];
            for (const itemRef of result.items) {
                const url = await itemRef.getDownloadURL();
                const metadata = await itemRef.getMetadata();
                
                images.push({
                    name: itemRef.name,
                    url: url,
                    size: metadata.size,
                    contentType: metadata.contentType,
                    updated: metadata.updated
                });
            }
            
            return images;
        } catch (error) {
            console.error('Error listing images:', error);
            throw error;
        }
    }

    // Compress image before upload
    async compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    }, 'image/jpeg', quality);
                };
                
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    // Batch upload multiple images
    async batchUploadImages(files, productIds) {
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
                const productId = productIds[i] || `product_${Date.now()}_${i}`;
                
                // Compress image if needed
                let fileToUpload = file;
                if (file.size > 1024 * 1024) { // If larger than 1MB
                    console.log(`Compressing large image: ${file.name}`);
                    fileToUpload = await this.compressImage(file);
                }
                
                const result = await this.uploadProductImage(fileToUpload, productId);
                results.push({ success: true, productId, ...result });
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        
        return results;
    }
}

// Create global instance
window.firebaseStorage = new FirebaseStorageManager();

// Auto-initialize when Firebase is ready
if (typeof firebase !== 'undefined') {
    window.firebaseStorage.init();
} else {
    // Wait for Firebase to load
    window.addEventListener('firebase-ready', () => {
        window.firebaseStorage.init();
    });
}