import { useState } from 'react';

export default function ProductForm() {
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        category: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product)
            });
            const data = await response.json();
            console.log('Product saved:', data);
            // Reset form
            setProduct({ name: '', description: '', price: '', category: '' });
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Product Name"
                required
            />
            <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Description"
                required
            />
            <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                placeholder="Price"
                required
            />
            <input
                type="text"
                name="category"
                value={product.category}
                onChange={handleChange}
                placeholder="Category"
                required
            />
            <button type="submit">Add Product</button>
        </form>
    );
}