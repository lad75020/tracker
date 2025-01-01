function initAutoComplete(){

    const input = document.getElementById('autocomplete-input');
    const suggestionsContainer = document.getElementById('autocomplete-suggestions');
    suggestionsContainer.style.left = `${input.offsetLeft +150}px`;
    // Fetch JSON data from a file
    fetch('https://tracker.dubertrand.fr/getAllTornItems.php')
        .then(response => response.json())
        .then(data => {
            input.addEventListener('input', () => {
                const query = input.value.toLowerCase();
                suggestionsContainer.innerHTML = '';

                if (query.length === 0) {
                    return;
                }

                const suggestions = data.filter(item => item.name.toLowerCase().includes(query));

                suggestions.forEach(suggestion => {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.className = 'autocomplete-suggestion';
                    suggestionElement.textContent = `${suggestion.name}`;
                    suggestionElement.addEventListener('click', () => {
                        input.value = suggestion.name;
                        document.getElementById('updatePrice').disabled =false;
                        document.getElementById('itemID').value = suggestion.id;
                        document.getElementById('price').style.color = 'white';
                        document.getElementById('price').innerText = suggestion.price;
                        suggestionsContainer.innerHTML = '';
                    });
                    suggestionsContainer.appendChild(suggestionElement);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}
