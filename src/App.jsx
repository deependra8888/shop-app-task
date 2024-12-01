import { Button, Checkbox, Input, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { BsCartPlus } from 'react-icons/bs';
import { FaFemale, FaMale, FaShoppingCart } from 'react-icons/fa';

const api = 'https://mocki.io/v1/4ef9fde5-c17f-4b99-9cb5-0a14ed5db18a';

export default function App() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();
    const [filteredData, setFilteredData] = useState();
    const [cart, setCart] = useState([]);
    const [colors, setColors] = useState([]);
    const [totalStock, setTotalStock] = useState({})

    const [filters, setFilters] = useState({
        search: '',
        color: [],
        gender: [],
        price: [],
        type: [],
    });

    const priceRanges = {
        '0-250': [0, 250],
        '251-450': [251, 450],
        '450+': [451, Infinity],
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(api);
            const fetchedData = await response.json();
            const uniqueColors = [...new Set(fetchedData.map((item) => item.color.toLowerCase()))];

            const totalStockEachItem = fetchedData?.reduce((acc, item) => {
                acc[item.id] = item.quantity;
                return acc;
            }, {});
            setColors(uniqueColors);
            setData(fetchedData);
            setFilteredData(fetchedData);
            setTotalStock(totalStockEachItem)
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const applyFilters = () => {
        let tempData = [...data];
    
        if (filters.search) {
            const query = filters.search.toLowerCase().trim();
            tempData = tempData.filter(
                (item) =>
                    item.name.toLowerCase().includes(query) ||
                    item.color.toLowerCase().includes(query) ||
                    item.type.toLowerCase().includes(query)
            );
        }
    
        if (filters.color.length) {
            tempData = tempData.filter((item) => filters.color.includes(item.color.toLowerCase()));
        }
    
        if (filters.gender.length) {
            tempData = tempData.filter((item) => filters.gender.includes(item.gender.toLowerCase()));
        }
    
        if (filters.price.length) {
            tempData = tempData.filter((item) => {
                return filters.price.some((range) => {
                    const [min, max] = priceRanges[range];
                    return item.price >= min && item.price <= max;
                });
            });
        }
    
        if (filters.type.length) {
            tempData = tempData.filter((item) => filters.type.includes(item.type.toLowerCase()));
        }
    
        setFilteredData(tempData);
    
        if (tempData.length === 0) {
            message.warning('No items found with the applied filters. Please try different options!');
        }
    };
    

    useEffect(() => {
        if (data && filters) {
            applyFilters();
        }
    }, [filters, data]);

    const onSearch = (e) => {
        setFilters((prev) => ({ ...prev, search: e.target.value }));
    };

    const onCheckboxChange = (key, value) => {
        setFilters((prev) => {
            const updated = prev[key].includes(value) ? prev[key].filter((item) => item !== value) : [...prev[key], value];
            return { ...prev, [key]: updated };
        });
    };

    function showOutOfStockToast(product, isInStock) {
        if (isInStock === 0) {
            message.error(`🚫 Out of Stock: "${product.name}" (${product.color} ${product.type} for ${product.gender}) is currently unavailable. Please check back later!`);
        } else {
            message.success(`✅ "${product.name}" is in stock!`);
        }
    }

    const addToCart = (product) => {
        let productIdToUpdate = product.id
        let updatedStock = totalStock[productIdToUpdate] - 1
        if (updatedStock < 0) return showOutOfStockToast(product, 0)
        else showOutOfStockToast(product, 1)
        setTotalStock(prev => ({ ...prev, [productIdToUpdate]: updatedStock }))

        setCart((prevCart) => [...prevCart, product]);
    };    

    const clearCart = () => {
        const totalStockEachItem = data?.reduce((acc, item) => {
            acc[item.id] = item.quantity;
            return acc;
        }, {});
        setTotalStock(totalStockEachItem)
        setCart([]);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            color: [],
            gender: [],
            price: [],
            type: [],
        });
    };


    return (
        <main className='h-full w-full'>
            <div className='container mx-auto p-4'>
                <header className='bg-gray-800 text-white p-4 flex justify-between items-center mb-4 rounded'>
                    <h1 className='text-2xl font-bold'>Shop</h1>
                    <div className='flex items-center gap-4'>
                        {cart.length > 0 && (
                            <Button
                                onClick={clearCart}
                                className='bg-red-600 text-white'
                            >
                                Clear Cart
                            </Button>
                        )}
                        <div className='relative'>
                            <FaShoppingCart size={24} />
                            {cart.length > 0 && (
                                <span className='absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm'>
                                    {cart.length}
                                </span>
                            )}
                        </div>
                    </div>
                </header>
                <div className="flex items-center justify-center space-x-4 mb-4">
                    <Input
                        className="flex-grow"
                        placeholder="Search by name, color, or type"
                        size="large"
                        onChange={onSearch}
                    />
                    <div className="sm:p-1">
                        <Button
                            onClick={clearFilters}
                            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition duration-200"
                        >
                            Reset Filters & Search
                        </Button>
                    </div>
                </div>




                {loading && (
                    <div className='w-full flex justify-center items-center gap-4 my-4'>
                        <Spin /> Loading...
                    </div>
                )}
                <div className='mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
                    <div>
                        <h2 className='font-bold mb-2'>Colors</h2>
                        {colors.map((color) => (
                            <Checkbox
                                key={color}
                                onChange={() => onCheckboxChange('color', color)}
                                checked={filters.color?.includes(color)}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: color,
                                        borderRadius: '50%',
                                        marginRight: '8px',
                                        border: '1px solid gray',
                                    }}
                                ></span>

                            </Checkbox>
                        ))}
                    </div>


                    <div>
                        <h2 className='font-bold mb-2'>Gender</h2>
                        {['men', 'women'].map((gender) => (
                            <Checkbox
                                key={gender}
                                onChange={() => onCheckboxChange('gender', gender)}
                                checked={filters.gender?.includes(gender)}
                            >
                                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                            </Checkbox>
                        ))}
                    </div>

                    <div>
                        <h2 className='font-bold mb-2'>Price</h2>
                        {Object.keys(priceRanges).map((range) => (
                            <Checkbox
                                key={range}
                                onChange={() => onCheckboxChange('price', range)}
                                checked={filters.price?.includes(range)}
                            >
                                {range}
                            </Checkbox>
                        ))}
                    </div>

                    <div>
                        <h2 className='font-bold mb-2'>Type</h2>
                        {['polo', 'hoodie', 'basic'].map((type) => (
                            <Checkbox
                                key={type}
                                onChange={() => onCheckboxChange('type', type)}
                                checked={filters.type?.includes(type)}

                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Checkbox>
                        ))}
                    </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {!loading &&
                        filteredData &&
                        filteredData.map((product) => {
                            const color = product.color;

                            return (
                                <div
                                    key={product.id}
                                    className='bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-3'
                                >
                                    <img
                                        src={product.imageURL}
                                        alt={product.name}
                                        className='w-full h-48 object-contain'
                                    />
                                    <div className='p-4'>
                                        <h2 className='text-lg font-semibold'>{product.name}</h2>

                                        <div className='flex items-center flex-wrap gap-2'>
                                            <div className='mt-2'>
                                                <div
                                                    className='w-4 h-4 rounded-full'
                                                    style={{
                                                        backgroundColor: color,
                                                        border: '1px solid gray',
                                                    }}
                                                ></div>
                                            </div>
                                            <p className='text-gray-700 capitalize mt-2'>{product.type}</p>
                                            <div className='flex items-center gap-2 mt-2'>
                                                <span className='bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm'>
                                                    Rs{product.price.toFixed(2)}
                                                </span>
                                                <span
                                                    className={`${product.gender === 'Men' ? 'bg-blue-300 text-blue-800' : 'bg-pink-300 text-pink-800'
                                                        } px-2 py-1 rounded-full text-sm flex gap-2 items-center`}
                                                >
                                                    {product.gender === 'Men' ? <FaMale size={20} /> : <FaFemale size={20} />}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='mt-4 flex justify-between'>
                                            <Button
                                                type='primary'
                                                icon={<BsCartPlus />}
                                                onClick={() => addToCart(product)}
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </main>
    );
}


