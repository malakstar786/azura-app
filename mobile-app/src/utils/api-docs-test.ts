import { makeApiCall } from './api-config';

async function testAndDocumentApis() {
    try {
        // 1. Home Service Block
        console.log('\n=== Testing Home Service Block ===');
        console.log('URL: https://new.azurakwt.com/index.php?route=extension/mstore/home|serviceBlock');
        const serviceBlock = await makeApiCall('/home|serviceBlock');
        console.log('Response:', JSON.stringify(serviceBlock, null, 2));

        // 2. Home Slider Block
        console.log('\n=== Testing Home Slider Block ===');
        console.log('URL: https://new.azurakwt.com/index.php?route=extension/mstore/home|sliderblock');
        const sliderBlock = await makeApiCall('/home|sliderblock');
        console.log('Response:', JSON.stringify(sliderBlock, null, 2));

        // 3. Features Blocks 1-6
        for (let i = 1; i <= 6; i++) {
            console.log(`\n=== Testing Features Block ${i} ===`);
            console.log(`URL: https://new.azurakwt.com/index.php?route=extension/mstore/home|featuresblock${i}`);
            const featuresBlock = await makeApiCall(`/home|featuresblock${i}`);
            console.log('Response:', JSON.stringify(featuresBlock, null, 2));
        }

        // 4. Main Menu
        console.log('\n=== Testing Main Menu ===');
        console.log('URL: https://new.azurakwt.com/index.php?route=extension/mstore/menu');
        const mainMenu = await makeApiCall('/menu');
        console.log('Response:', JSON.stringify(mainMenu, null, 2));

        // 5. Get All Products
        console.log('\n=== Testing Get All Products ===');
        console.log('URL: https://new.azurakwt.com/index.php?route=extension/mstore/product');
        const allProducts = await makeApiCall('/product');
        console.log('Response:', JSON.stringify(allProducts, null, 2));

        // 6. Products by Category
        const categories = [
            { id: '20', name: 'Nail Care' },
            { id: '18', name: 'Fragrances' },
            { id: '19', name: 'Makeup' }
        ];

        for (const category of categories) {
            console.log(`\n=== Testing Products for Category ${category.name} ===`);
            console.log(`URL: https://new.azurakwt.com/index.php?route=extension/mstore/product?category=${category.id}`);
            const categoryProducts = await makeApiCall('/product', {
                params: { category: category.id }
            });
            console.log('Response:', JSON.stringify(categoryProducts, null, 2));
        }

        // 7. Product Detail
        console.log('\n=== Testing Product Detail ===');
        console.log('URL: https://new.azurakwt.com/index.php?route=extension/mstore/product|detail?productId=51');
        const productDetail = await makeApiCall('/product|detail', {
            params: { productId: '51' }
        });
        console.log('Response:', JSON.stringify(productDetail, null, 2));

    } catch (error) {
        console.error('Documentation test failed:', error);
    }
}

testAndDocumentApis(); 