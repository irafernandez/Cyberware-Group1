document.addEventListener('DOMContentLoaded', () => {
    // --- SIMULATION MODE ---
    const form = document.getElementById('verification-form');
    const resultsArea = document.getElementById('results-display-area');
    const verifyButton = document.querySelector('.btn-verify');
    
    // Get all result elements by their IDs
    const resultElements = {
        valid: document.getElementById('result-valid'),
        carrier: document.getElementById('result-carrier'),
        country: document.getElementById('result-country'),
        location: document.getElementById('result-location'),
        international: document.getElementById('result-international')
    };

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Stop the default form submission

        const countryCode = document.getElementById('country-code').value.toUpperCase().trim();
        const phoneNumber = document.getElementById('phone-number').value.trim().replace(/[\s-]/g, '');

        if (countryCode.length !== 2 || phoneNumber === '') {
            alert("Please enter a 2-letter Country Code and the Phone Number.");
            return;
        }
        
        // Show loading state and ensure results panel is visible
        resultsArea.classList.remove('d-none');
        showLoadingState();

        // Disable button and change text while processing
        verifyButton.disabled = true;
        verifyButton.textContent = 'VALIDATING...';
        
        // Simulate a 2-second API delay
        setTimeout(() => {
            const simulatedData = simulateNumVerifyResponse(countryCode, phoneNumber);
            
            if (simulatedData.error) {
                displayError(`Validation Failed: ${simulatedData.error.info || 'An unknown error occurred.'}`);
            } else {
                updateResultsPanel(simulatedData);
            }

            // Restore button state
            verifyButton.disabled = false;
            verifyButton.textContent = 'VALIDATE NUMBER INTEGRITY';
        }, 2000);
    });
    
    // ==========================================================
    // REMOVED COMPLEX RESET LISTENER 
    // The button click handler is now inside displayError for simplicity
    // ==========================================================

    function showLoadingState() {
        // Reset styles and set text to loading
        for (const key in resultElements) {
            resultElements[key].textContent = 'Processing...';
            resultElements[key].className = 'result-value text-info-neon';
        }
    }

    // (simulateNumVerifyResponse function is unchanged)
    function simulateNumVerifyResponse(code, number) {
        let response = {};
        const numPrefix = number.substring(0, 3);
        let carrier = 'Generic Carrier';
        let location = 'Unknown Region';
        let countryName = 'Unknown Country';
        let internationalFormat = `+?? ${number}`;
        let countryPrefix = '??';

        const isUSValid = (code === 'US' || code === 'CA') && number.length === 10 && /^\d+$/.test(number);
        const isPHValid = code === 'PH' && number.length === 10 && /^\d+$/.test(number); 
        
        const isValid = isUSValid || isPHValid;

        if (isUSValid) {
            countryName = 'United States of America';
            location = 'New York, NY';
            countryPrefix = '+1';
            internationalFormat = `+1 ${number}`;
            carrier = (numPrefix < '500') ? 'Verizon Wireless' : 'T-Mobile USA';
        } else if (isPHValid) {
            countryName = 'Philippines';
            location = 'Metro Manila';
            countryPrefix = '+63';
            internationalFormat = `+63 ${number}`;

            if (['907', '908', '909', '910', '912', '918', '919', '920', '921', '928', '929', '930', '939', '946', '947', '948', '949', '950', '951', '989', '998', '999'].includes(numPrefix)) {
                carrier = 'SMART Communications';
            } else if (['905', '906', '915', '916', '917', '925', '926', '927', '935', '936', '937', '945', '953', '954', '955', '956', '965', '966', '967', '977', '978', '994', '995', '996', '997'].includes(numPrefix)) {
                carrier = 'Globe Telecom';
            } else {
                carrier = 'DITO / Other PH Network';
            }
        }


        if (isValid) {
            response = {
                valid: true,
                number: number,
                local_format: isUSValid ? `(${number.substring(0, 3)}) ${number.substring(3, 6)}-${number.substring(6, 10)}` : number,
                international_format: internationalFormat,
                country_prefix: countryPrefix,
                country_code: code,
                country_name: countryName,
                location: location,
                carrier: carrier,
                line_type: 'mobile'
            };
        } else {
            response = {
                valid: false,
                number: number,
                local_format: null,
                international_format: null,
                country_prefix: null,
                country_code: code,
                country_name: 'Unknown/Invalid',
                location: '',
                carrier: '',
                line_type: '',
                error: {
                    code: 210,
                    type: 'invalid_number',
                    info: 'The number is either not a valid phone number or its format is incorrect.'
                }
            };
        }
        return response;
    }

    function updateResultsPanel(data) {
        // ... (Update panel logic is unchanged)
        const isValid = data.valid;
        resultElements.valid.textContent = isValid ? 'YES' : 'NO';
        resultElements.valid.className = isValid ? 'result-value text-success-neon' : 'result-value text-danger-neon';

        resultElements.carrier.textContent = data.carrier || 'N/A';
        resultElements.country.textContent = data.country_name || data.country_code || 'N/A';
        resultElements.location.textContent = data.location || 'N/A';

        if (isValid) {
            resultElements.international.textContent = data.international_format || 'N/A';
            resultElements.international.className = 'result-value text-info-neon';
        } else {
            resultElements.international.textContent = 'Invalid - Format Not Available';
            resultElements.international.className = 'result-value';
        }

        resultElements.carrier.className = 'result-value';
        resultElements.location.className = 'result-value';
        resultElements.country.className = 'result-value';
    }

    // (displayError function is updated to use location.reload())
    function displayError(message) {
        // Display a clear error message in the results panel area
        const errorHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading text-danger-neon">Validation Failed</h4>
                    <p class="text-light">${message}</p>
                    <hr>
                    <p class="mb-3 text-light">Please check the country code and number format, then try again.</p>
                    <button onclick="location.reload()" class="btn btn-sm btn-verify fw-bold">
                        RE-DO VERIFICATION
                    </button>
                </div>
            </div>
        `;
        resultsArea.innerHTML = errorHTML;
        resultsArea.classList.remove('d-none');
    }
});