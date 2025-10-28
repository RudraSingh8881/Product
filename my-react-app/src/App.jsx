import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [page, setPage] = useState('landing')
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [editProduct, setEditProduct] = useState(null)

  const baseUrl = import.meta.env.VITE_API_URL // ✅ backend URL

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedIn')
    if (loggedInUser) {
      setUser(loggedInUser)
      setPage('landing')
    } else {
      setPage('login')
    }
  }, [])

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : ''
  }, [darkMode])

  // ✅ Create or update product
  const handleSaveProduct = async (product) => {
    try {
      if (editProduct) {
        const res = await fetch(`${baseUrl}/api/products/${editProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        })
        if (!res.ok) throw new Error(`Update failed: ${res.status}`)
        const updated = await res.json()
        setProducts(products.map(p => p.id === editProduct.id ? { ...updated, id: updated._id } : p))
        setEditProduct(null)
      } else {
        const res = await fetch(`${baseUrl}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        })
        if (!res.ok) throw new Error(`Create failed: ${res.status}`)
        const created = await res.json()
        setProducts([...products, { ...created, id: created._id }])
      }
    } catch (err) {
      console.error('Product save error:', err)
      alert(err.message)
    }
  }

  // ✅ Delete product
  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 404) throw new Error(`Delete failed: ${res.status}`)
      setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      console.error('Delete error:', err)
      alert(err.message)
    }
  }

  // ✅ Login user
  const handleLogin = async (username, password) => {
    try {
      const res = await fetch(`${baseUrl}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setPage('landing');
    } catch (err) {
      console.error('Login error:', err);
      alert(err.message);
    }
  }

  // ✅ Register user
  const handleRegister = async (username, password) => {
    try {
      const res = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) throw new Error('Registration failed')
      alert('Registration successful!')
      setPage('login')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('loggedIn')
    setUser(null)
    setPage('login')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🛍️ Product Management</h1>
          <nav>
            <button onClick={() => setPage('landing')}>Home</button>
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            {user && <button onClick={() => setPage('products')}>Products</button>}
            {user && <button onClick={handleLogout}>Logout</button>}
          </nav>
        </div>
      </header>

      <main className="main">
        {page === 'landing' && (
          <div className="landing">
            <h2>Welcome to Product Management</h2>
            <button onClick={() => setPage('products')}>Enter Products</button>
          </div>
        )}

        {page === 'login' && (
          <form onSubmit={(e) => {
            e.preventDefault()
            handleLogin(e.target.username.value, e.target.password.value)
          }} className="auth-form">
            <input name="username" placeholder="Username" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Login</button>
            <p>No account? <button type="button" onClick={() => setPage('register')}>Register</button></p>
          </form>
        )}

        {page === 'register' && (
          <form onSubmit={(e) => {
            e.preventDefault()
            handleRegister(e.target.username.value, e.target.password.value)
          }} className="auth-form">
            <input name="username" placeholder="Username" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Register</button>
            <p>Have an account? <button type="button" onClick={() => setPage('login')}>Login</button></p>
          </form>
        )}

        {page === 'products' && user && (
          <div className="products">
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSaveProduct({
                name: e.target.name.value,
                description: e.target.description.value,
                price: parseFloat(e.target.price.value),
                image: e.target.image.value
              })
              e.target.reset()
            }} className="product-form">
              <input name="name" placeholder="Product Name" required />
              <input name="description" placeholder="Description" />
              <input name="price" type="number" placeholder="Price" required step="0.01" />
              <input name="image" placeholder="Image URL" />
              <button type="submit">{editProduct ? 'Update' : 'Add'} Product</button>
              {editProduct && (
                <button type="button" onClick={() => setEditProduct(null)}>Cancel</button>
              )}
            </form>

            <div className="product-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  {product.image && <img src={product.image} alt={product.name} />}
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p>₹{product.price}</p>
                  <button onClick={() => setEditProduct(product)}>Edit</button>
                  <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        © 2025 Product Management • Built with React
      </footer>
    </div>
  )
}

export default App
