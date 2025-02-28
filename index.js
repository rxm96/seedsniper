const axios = require('axios'); 
require('axios'); 
const fs = require('fs');
const path = require('path');

function getParamsFromArgs() {
    const args = process.argv.slice(2);
    const params = {};
    let seedValues = []; 
    let apiKey = null; 
    
    if (args.length === 0) {
        console.log('No parameters specified. Usage:');
        console.log('node index.js --def_index 515 --paint_index 569 [--max_float 0.08] [--seeds 123,456,789] --api-key YOUR_API_KEY');
        return { params, seedValues, apiKey };
    }
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--def_index' && args[i+1]) {
            params.def_index = parseInt(args[i+1], 10);
            i++;
        } 
        else if (args[i] === '--paint_index' && args[i+1]) {
            params.paint_index = parseInt(args[i+1], 10);
            i++;
        }
        else if (args[i] === '--max_float' && args[i+1]) {
            params.max_float = parseFloat(args[i+1]);
            i++;
        }
        else if (args[i] === '--api-key' && args[i+1]) {
            apiKey = args[i+1];
            console.log('API key loaded from command line argument.');
            i++;
        }
        else if (args[i] === '--seeds') {
            while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                const seedsInArg = args[i + 1].split(',');
                
                for (const seed of seedsInArg) {
                    const parsedSeed = parseInt(seed.trim(), 10);
                    if (!isNaN(parsedSeed)) {
                        seedValues.push(parsedSeed);
                    }
                }
                
                i++; 
            }
        }
    }

    params.limit = 50;
    params.sortBy = 'best_deal'

    return { params, seedValues, apiKey };
}

function getAPIKey(apiKey) {
    if (!apiKey) {
        console.error('No API key provided. Please use the --api-key argument.');
        console.error('Example: ./csfloat.exe --def_index 515 --paint_index 569 --api-key YOUR_API_KEY');
        process.exit(1);
    }
    return apiKey;
}

async function getFilteredListings(filters = {}, cursor = null, apiKey = null) {
    try {
        const authKey = getAPIKey(apiKey);
        
        const config = {
            headers: {
                'Authorization': `${authKey}`
            },
            params: { ...filters }
        };

        if (cursor) {
            config.params.cursor = cursor;
        }

        console.log('Sending API request with filters:', config.params);
        const response = await axios.get('https://csfloat.com/api/v1/listings', config);
        
        return {
            listings: response.data.data || [],
            cursor: response.data.cursor
        };
    } catch (error) {
        console.error('Error retrieving listings:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
        return { listings: [], cursor: null };
    }
}

async function main() {
    // Get parameters from command line arguments
    const { params, seedValues, apiKey } = getParamsFromArgs();
    
    if (Object.keys(params).length === 0) {
        console.log('No valid filters specified. Exiting program.');
        return;
    }
    
    console.log('Searching for listings with the following filters:');
    console.log(params);
    
    if (seedValues.length > 0) {
        console.log(`Local filtering by paint seeds: ${seedValues.join(', ')}`);
    }
    
    let allListings = [];
    let cursor = null;
    
    do {
        const result = await getFilteredListings(params, cursor, apiKey);
        
        if (result.listings.length > 0) {
            allListings = [...allListings, ...result.listings];
            console.log(`${result.listings.length} new listings found (Total: ${allListings.length})`);
        } else {
            console.log(`No more listings found.`);
        }
        
        cursor = result.cursor;
        
    } while (cursor);
    
    console.log(`Total of ${allListings.length} listings found.`);
    
    let filteredListings = allListings;
    if (seedValues.length > 0) {
        filteredListings = allListings.filter(listing => 
            seedValues.includes(listing.item.paint_seed)
        );
        console.log(`${filteredListings.length} listings found with the specified paint seeds.`);
    }
    
    if (filteredListings.length > 0) {
        filteredListings.reverse().forEach(listing => {
            const price = (listing.price / 100).toFixed(2);
            
            let phaseInfo = '';
            if (listing.item.phase !== undefined) {
                phaseInfo = `Phase: ${listing.item.phase}`;
            } else if (listing.item.doppler_phase !== undefined) {
                phaseInfo = `Phase: ${listing.item.doppler_phase}`;
            }
            
            console.log(`
----------------------------------------
Name: ${listing.item.item_name}
Price: $${price}
Float: ${listing.item.float_value}
Paint Seed: ${listing.item.paint_seed || 'N/A'}
${phaseInfo ? phaseInfo : ''}
URL: https://csfloat.com/item/${listing.id}
----------------------------------------`);
        });
    } else {
        console.log('No matching listings found.');
    }
}

main().catch(error => {
    console.error('An error occurred:', error);
    process.exit(1);
});