document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const inventoryList = document.getElementById('inventory-list');
    const addItemBtn = document.getElementById('add-item-btn');
    const scanBarcodeBtn = document.getElementById('scan-barcode-btn');
    const searchInventory = document.getElementById('search-inventory');
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const itemModal = document.getElementById('item-modal');
    const closeBtn = document.querySelector('.close-btn');
    const itemForm = document.getElementById('item-form');

    // Mock API URL (in a real app, replace with your actual API endpoint)
    const API_URL = 'AIzaSyBRnnYCKBvBabv4FE7HKxzA2p2v9XkQaUk';

    // Sample inventory data (in a real app, this would come from the API)
    let inventory = [
        {
            id: 1,
            name: "Milk",
            category: "food",
            quantity: 2,
            location: "Fridge",
            expiry: "2023-12-15",
            notes: "Organic whole milk"
        },
        {
            id: 2,
            name: "Passport",
            category: "documents",
            quantity: 1,
            location: "Safe",
            expiry: "2028-05-20",
            notes: "In the black folder"
        },
        {
            id: 3,
            name: "Laptop",
            category: "electronics",
            quantity: 1,
            location: "Home office",
            notes: "MacBook Pro 2020"
        }
    ];
    // Contributor interaction
    document.querySelectorAll('.contributor').forEach(contributor => {
        contributor.addEventListener('click', function () {
            const contributorId = this.dataset.id;
            const contributions = {
                '12307660': 'Backend Development & AI Integration',
                '12307667': 'Frontend Development & UI Design',
                '12309725': 'Database Architecture & Security'
            };

            addBotMessage(`Contributor ${contributorId} handled ${contributions[contributorId]}. ` +
                `We appreciate their hard work! 🎉`);
        });
    });
    // Initialize the app
    function init() {
        renderInventory();
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Inventory buttons
        addItemBtn.addEventListener('click', openAddItemModal);
        scanBarcodeBtn.addEventListener('click', scanBarcode);
        searchInventory.addEventListener('input', filterInventory);

        // Chat interface
        sendBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') sendMessage();
        });
        voiceBtn.addEventListener('click', startVoiceRecognition);

        // Modal
        closeBtn.addEventListener('click', closeAddItemModal);
        window.addEventListener('click', function (e) {
            if (e.target === itemModal) closeAddItemModal();
        });

        // Form submission
        itemForm.addEventListener('submit', function (e) {
            e.preventDefault();
            addNewItem();
        });
    }

    // Render inventory list
    function renderInventory(filteredItems = null) {
        inventoryList.innerHTML = '';
        const itemsToRender = filteredItems || inventory;

        console.log('Rendering items:', itemsToRender); // Debugging the items being rendered

        if (itemsToRender.length === 0) {
            inventoryList.innerHTML = '<p class="empty-message">No items found. Add some items to your inventory!</p>';
            return;
        }

        itemsToRender.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.innerHTML = `
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${formatCategory(item.category)} • Qty: ${item.quantity} • Location: ${item.location}</p>
                    ${item.expiry ? `<p class="expiry">Expires: ${formatDate(item.expiry)}</p>` : ''}
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            inventoryList.appendChild(itemElement);
        });
    }

    // Filter inventory based on search input
    function filterInventory() {
        const searchTerm = searchInventory.value.toLowerCase();
        if (!searchTerm) {
            renderInventory();
            return;
        }

        const filtered = inventory.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.location.toLowerCase().includes(searchTerm) ||
            (item.notes && item.notes.toLowerCase().includes(searchTerm))
        );

        renderInventory(filtered);
    }

    // Modal functions
    function openAddItemModal() {
        itemModal.style.display = 'block';
    }

    function closeAddItemModal() {
        itemModal.style.display = 'none';
        itemForm.reset();
    }

    // Add new item to inventory
    function addNewItem() {
        const newItem = {
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value,
            quantity: parseInt(document.getElementById('item-quantity').value) || 1,
            location: document.getElementById('item-location').value || 'Unknown',
            expiry: document.getElementById('item-expiry').value || null,
            notes: document.getElementById('item-notes').value || ''
        };

        fetch(API_URL + '/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        })
            .then(response => response.json())
            .then(data => {
                inventory.push(data); // Add the new item to the local array
                renderInventory();
                closeAddItemModal();
                addBotMessage(`I've added ${newItem.name} to your inventory.`);
            })
            .catch(error => console.error('Error adding item:', error));
    }

    // Edit item
    function editItem(itemId) {
        const item = inventory.find(item => item.id === itemId);
        if (!item) return;

        // Populate the form with item data
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-location').value = item.location;
        document.getElementById('item-expiry').value = item.expiry || '';
        document.getElementById('item-notes').value = item.notes || '';

        // Change form to edit mode
        itemForm.onsubmit = function (e) {
            e.preventDefault();
            updateItem(itemId);
        };

        document.querySelector('.submit-btn').textContent = 'Update Item';
        openAddItemModal();
    }

    // Update item
    function updateItem(itemId) {
        const updatedItem = {
            id: itemId,
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value,
            quantity: parseInt(document.getElementById('item-quantity').value) || 1,
            location: document.getElementById('item-location').value || 'Unknown',
            expiry: document.getElementById('item-expiry').value || null,
            notes: document.getElementById('item-notes').value || ''
        };

        fetch(`${API_URL}/inventory/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedItem)
        })
            .then(response => response.json())
            .then(data => {
                const itemIndex = inventory.findIndex(item => item.id === itemId);
                inventory[itemIndex] = data; // Update the local array
                renderInventory();
                closeAddItemModal();
                addBotMessage(`I've updated ${updatedItem.name} in your inventory.`);
            })
            .catch(error => console.error('Error updating item:', error));
    }

    // Delete item
    function deleteItem(itemId) {
        fetch(`${API_URL}/inventory/${itemId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    const itemIndex = inventory.findIndex(item => item.id === itemId);
                    const itemName = inventory[itemIndex].name;
                    inventory.splice(itemIndex, 1); // Remove the item from the local array
                    renderInventory();
                    addBotMessage(`I've removed ${itemName} from your inventory.`);
                }
            })
            .catch(error => console.error('Error deleting item:', error));
    }

    // Barcode scanning (mock implementation)
    function scanBarcode() {
        addBotMessage("Please scan the barcode now. (This is a demo - in a real app, this would activate your device's camera for scanning.)");

        // Simulate finding a product after scanning
        setTimeout(() => {
            const mockProducts = [
                { name: "Organic Eggs (12pk)", category: "food", commonLocation: "Fridge" },
                { name: "Toilet Paper (12 rolls)", category: "household", commonLocation: "Bathroom cabinet" },
                { name: "iPhone Charger", category: "electronics", commonLocation: "Living room drawer" }
            ];

            const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];

            addBotMessage(`I found this product: ${randomProduct.name}. Would you like to add it to your inventory?`);

            // Create quick reply buttons
            const quickReplies = document.createElement('div');
            quickReplies.className = 'quick-replies';
            quickReplies.innerHTML = `
                <button class="quick-reply" data-name="${randomProduct.name}" data-category="${randomProduct.category}" data-location="${randomProduct.commonLocation}">Yes, add it</button>
                <button class="quick-reply">No, thanks</button>
            `;

            // Append to the last bot message
            const botMessages = document.querySelectorAll('.bot-message');
            const lastBotMessage = botMessages[botMessages.length - 1];
            lastBotMessage.querySelector('.message-content').appendChild(quickReplies);

            // Add event listeners to quick replies
            document.querySelectorAll('.quick-reply').forEach(btn => {
                btn.addEventListener('click', function () {
                    if (this.textContent.includes("Yes")) {
                        const name = this.getAttribute('data-name');
                        const category = this.getAttribute('data-category');
                        const location = this.getAttribute('data-location');

                        // Auto-fill the form
                        document.getElementById('item-name').value = name;
                        document.getElementById('item-category').value = category;
                        document.getElementById('item-location').value = location;
                        document.getElementById('item-quantity').value = 1;

                        openAddItemModal();
                    }

                    // Remove the quick replies
                    this.parentElement.remove();
                });
            });
        }, 1500);
    }

    // Chat functions
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addUserMessage(message);
        userInput.value = '';

        // Process the message and generate a response
        processUserMessage(message);
    }

    function addUserMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.innerHTML = `
            <div class="avatar"><i class="fas fa-user"></i></div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
        chatContainer.appendChild(messageElement);
        scrollChatToBottom();
    }

    function addBotMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message bot-message';
        messageElement.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
        chatContainer.appendChild(messageElement);
        scrollChatToBottom();
    }

    function scrollChatToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Process user message and generate appropriate response
    function processUserMessage(message) {
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-message bot-message typing-indicator';
        typingIndicator.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatContainer.appendChild(typingIndicator);
        scrollChatToBottom();

        // Simulate processing delay
        setTimeout(() => {
            // Remove typing indicator
            typingIndicator.remove();

            // Process the message
            const lowerMessage = message.toLowerCase();

            if (lowerMessage.includes('add') && lowerMessage.includes('to') && lowerMessage.includes('inventory')) {
                // Handle adding items through chat
                handleAddItemCommand(message);
            }
            else if (lowerMessage.includes('list') || lowerMessage.includes('show') || lowerMessage.includes('display')) {
                // Handle listing items
                handleListCommand(message);
            }
            else if (lowerMessage.includes('where') || lowerMessage.includes('location')) {
                // Handle location queries
                handleLocationQuery(message);
            }
            else if (lowerMessage.includes('expir') || lowerMessage.includes('soon')) {
                // Handle expiry queries
                handleExpiryQuery();
            }
            else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
                addBotMessage("You're welcome! Is there anything else I can help you with?");
            }
            else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
                addBotMessage("Hello! How can I assist you with your home inventory today?");
            }
            else {
                // Default response for unrecognized commands
                addBotMessage("I'm not sure I understand. You can ask me to add items, list your inventory, or tell you where something is stored. How can I help?");
            }
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    }

    // Handle "add [item] to inventory" commands
    function handleAddItemCommand(message) {
        // Updated regex to handle "add [item] to [location]" or "add [item] in [location]"
        const match = message.match(/add (.+) (?:to|in) (.+)/i);
        if (match) {
            const itemName = match[1].trim();

            // Ask for the category
            addBotMessage(`I'll help you add "${itemName}" to your inventory. What category does it belong to?`);

            // Create quick reply buttons for categories
            const quickReplies = document.createElement('div');
            quickReplies.className = 'quick-replies';
            quickReplies.innerHTML = `
                <button class="quick-reply" data-item="${itemName}" data-category="appliances">Appliances</button>
                <button class="quick-reply" data-item="${itemName}" data-category="electronics">Electronics</button>
                <button class="quick-reply" data-item="${itemName}" data-category="furniture">Furniture</button>
                <button class="quick-reply" data-item="${itemName}" data-category="other">Other</button>
            `;

            // Append to the last bot message
            const botMessages = document.querySelectorAll('.bot-message');
            const lastBotMessage = botMessages[botMessages.length - 1];
            lastBotMessage.querySelector('.message-content').appendChild(quickReplies);

            // Add event listeners to quick replies
            document.querySelectorAll('.quick-reply').forEach(btn => {
                btn.addEventListener('click', function () {
                    const category = this.getAttribute('data-category');
                    const item = this.getAttribute('data-item');

                    // Ask for the location with a dropdown
                    addBotMessage(`Great! Where would you like to store "${item}"? Please select a location.`);

                    // Create a dropdown for location selection
                    const locationDropdown = document.createElement('div');
                    locationDropdown.className = 'location-dropdown';
                    locationDropdown.innerHTML = `
                        <select id="location-select">
                            <option value="Hall">Hall</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Room">Room</option>
                            <option value="Safe">Safe</option>
                            <option value="Wardrobe">Wardrobe</option>
                            <option value="Bathroom">Bathroom</option>
                            <option value="Other">Other</option>
                        </select>
                        <button id="confirm-location-btn">Confirm</button>
                    `;

                    // Append the dropdown to the last bot message
                    const botMessages = document.querySelectorAll('.bot-message');
                    const lastBotMessage = botMessages[botMessages.length - 1];
                    lastBotMessage.querySelector('.message-content').appendChild(locationDropdown);

                    // Add event listener to the confirm button
                    document.getElementById('confirm-location-btn').addEventListener('click', function () {
                        const location = document.getElementById('location-select').value;
                        addNewItem(item, category, location);

                        // Remove the dropdown after selection
                        locationDropdown.remove();
                    });
                });
            });
        } else {
            addBotMessage("I couldn't understand your request. Please try saying something like 'Add washing machine to the bathroom'.");
        }
    }

    // Function to add a new item to the inventory
    function addNewItem(name, category, location) {
        inventory.push({
            id: inventory.length + 1,
            name,
            category,
            quantity: 1,
            location,
            notes: '',
        });
        addBotMessage(`"${name}" has been added to your inventory under the "${category}" category in "${location}".`);
        renderInventory();
    }

    // Handle "list/show/display" commands
    function handleListCommand(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('appliance')) {
            // Show appliances
            const applianceItems = inventory.filter(item => item.category.toLowerCase() === 'appliances');
            console.log('Filtered appliances:', applianceItems); // Debugging the filtered items
            renderInventory(applianceItems);
            addBotMessage("Here are all the appliances in your inventory:");
        } else {
            // Default: show all items
            renderInventory();
            addBotMessage("Here's your complete inventory. You can also ask for specific categories like 'Show me all food items' or 'Show me all appliances'.");
        }
    }

    // Handle "where is [item]" queries
    function handleLocationQuery(message) {
        // Remove common stop words like "my," "the," etc.
        const cleanedMessage = message.replace(/\b(my|the|a|an|is|where|in|at)\b/gi, '').trim();
        const itemName = cleanedMessage.replace(/where(?:'s| is)? (.+)/i, '$1').trim();

        if (!itemName) {
            addBotMessage("I couldn't determine what item you're asking about. Could you try again? For example: 'Where is my passport?'");
            return;
        }

        // Search for the item (partial match)
        const matchingItems = inventory.filter(item =>
            item.name.toLowerCase().includes(itemName.toLowerCase())
        );

        if (matchingItems.length === 0) {
            addBotMessage(`I couldn't find "${itemName}" in your inventory. Would you like to add it?`);

            // Create quick reply buttons
            const quickReplies = document.createElement('div');
            quickReplies.className = 'quick-replies';
            quickReplies.innerHTML = `
                <button class="quick-reply" data-name="${itemName}">Yes, add it</button>
                <button class="quick-reply">No, thanks</button>
            `;

            // Append to the last bot message
            const botMessages = document.querySelectorAll('.bot-message');
            const lastBotMessage = botMessages[botMessages.length - 1];
            lastBotMessage.querySelector('.message-content').appendChild(quickReplies);

            // Add event listeners to quick replies
            document.querySelectorAll('.quick-reply').forEach(btn => {
                btn.addEventListener('click', function () {
                    if (this.textContent.includes("Yes")) {
                        const name = this.getAttribute('data-name');

                        // Auto-fill the form
                        document.getElementById('item-name').value = name;
                        document.getElementById('item-quantity').value = 1;

                        openAddItemModal();
                    }

                    // Remove the quick replies
                    this.parentElement.remove();
                });
            });
        } else if (matchingItems.length === 1) {
            const item = matchingItems[0];
            addBotMessage(`Your ${item.name} is stored in ${item.location}. ${item.notes ? `Note: ${item.notes}` : ''}`);
        } else {
            let response = `I found multiple items matching "${itemName}":<ul>`;
            matchingItems.forEach(item => {
                response += `<li>${item.name} - Location: ${item.location}</li>`;
            });
            response += "</ul>";
            addBotMessage(response);
        }
    }

    // Handle expiry-related queries
    function handleExpiryQuery() {
        const now = new Date();
        const soon = new Date();
        soon.setDate(now.getDate() + 14); // 2 weeks from now

        const expiringSoon = inventory.filter(item => {
            if (!item.expiry) return false;
            const expiryDate = new Date(item.expiry);
            return expiryDate <= soon;
        });

        if (expiringSoon.length === 0) {
            addBotMessage("Nothing in your inventory is expiring soon. Great job!");
        }
        else {
            let response = "Here are items that will expire soon:<ul>";
            expiringSoon.forEach(item => {
                response += `<li>${item.name} - Expires: ${formatDate(item.expiry)} (Location: ${item.location})</li>`;
            });
            response += "</ul>";
            addBotMessage(response);
        }
    }

    // Voice recognition
    function startVoiceRecognition() {
        addBotMessage("Please speak now. (Note: This is a demo - in a real app, this would use the Web Speech API.)");

        // Simulate voice recognition result after a delay
        setTimeout(() => {
            const sampleCommands = [
                "Add milk to my inventory",
                "Where is my passport?",
                "Show me all electronics",
                "What items are expiring soon?",
                "List all food items"
            ];

            const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];

            // Display what the system "heard"
            addUserMessage(randomCommand);

            // Process the command
            processUserMessage(randomCommand);
        }, 2000);
    }

    // Helper functions
    function formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Initialize the app
    init();

    // Suggest items based on query and location
    function suggestItems(items) {
        let response = "Here are some items you might need:<ul>";
        items.forEach(item => {
            response += `<li>${item}</li>`;
        });
        response += "</ul>";
        addBotMessage(response);
    }

    // Example usage of suggestItems function
    const query = "cool";
    const location = "hall room";
    if (query.includes('cool') && location === 'hall room') {
        suggestItems(['Fan', 'Air Conditioner', 'Curtains']);
    }

    // Fetch inventory from API
    function fetchInventory() {
        fetch(API_URL + '/inventory')
            .then(response => response.json())
            .then(data => {
                inventory = data; // Update the local inventory array
                renderInventory();
            })
            .catch(error => console.error('Error fetching inventory:', error));
    }
});