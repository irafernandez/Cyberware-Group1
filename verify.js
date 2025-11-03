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

    // Initialize the international telephone input
    const phoneInputField = document.getElementById('phone-number');
    let iti;

    // We must ensure the utils script is loaded before initializing ITI
    // The CDN link for utils is already in HTML, but we use the promise pattern for safety.
    try {
        iti = window.intlTelInput(phoneInputField, {
            // Updated to the latest CDN for both ITI and utils.
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/23.0.10/js/utils.js",
            initialCountry: "auto",
            geoIpLookup: function(callback) {
                // Placeholder for real GeoIP lookup, default to US for simulation consistency
                fetch("https://ipapi.co/json/")
                    .then(res => res.json())
                    .then(data => callback(data.country_code))
                    .catch(() => callback("us"));
            },
            preferredCountries: ['us', 'ph', 'ca', 'gb']
        });
    } catch (e) {
        console.error("intlTelInput initialization failed:", e);
        // Handle case where ITI might not load
        displayError("The International Telephone Input failed to initialize. Please check network connection.");
        return;
    }


    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Stop the default form submission

        // Check for basic input validity using the ITI utility
        if (!iti.isValidNumber()) {
            const errorCode = iti.getValidationError();
            let errorMessage = "Invalid Phone Number. ";
            
            // Map ITI error codes to human-readable messages
            switch (errorCode) {
                case intlTelInput.utils.validationError.IS_POSSIBLE:
                    errorMessage = "The number is too short or too long.";
                    break;
                case intlTelInput.utils.validationError.NOT_A_NUMBER:
                    errorMessage = "Input contains non-digit characters.";
                    break;
                case intlTelInput.utils.validationError.TOO_SHORT:
                    errorMessage = "The number is too short for the selected country.";
                    break;
                case intlTelInput.utils.validationError.TOO_LONG:
                    errorMessage = "The number is too long for the selected country.";
                    break;
                default:
                    errorMessage += "Please check the number and selected country flag.";
            }

            displayError(errorMessage);
            return;
        }

        // --- 1. EXTRACT DATA from ITI INSTANCE ---
        const countryData = iti.getSelectedCountryData();
        // Get the full number in E.164 format (e.g., +12025550149)
        const internationalFormat = iti.getNumber(); 
        
        // Get the national number (without country code) for use in the SIMULATION logic
        const nationalNumber = iti.getNumber(intlTelInput.utils.numberFormat.NATIONAL)
                                 .replace(/[^\d]/g, ''); // Strip all non-digits from national format
        
        const countryCode = countryData.iso2.toUpperCase();
        
        // Show loading state and ensure results panel is visible
        resultsArea.classList.remove('d-none');
        showLoadingState();

        // Disable button and change text while processing
        verifyButton.disabled = true;
        verifyButton.textContent = 'VALIDATING...';
        
        // Simulate a 2-second API delay
        setTimeout(() => {
            // Pass the extracted country code and cleaned national number to the simulation
            // The simulation function is now responsible for decorating the valid number.
            const simulatedData = simulateNumVerifyResponse(countryCode, nationalNumber, internationalFormat);
            
            if (simulatedData.error) {
                // This shouldn't happen if iti.isValidNumber() passes, but keeps the error handler.
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
    // SIMULATION AND DISPLAY FUNCTIONS (Updated for better handling)
    // ==========================================================

    /**
     * Simulates an API response based on the country and number.
     * CRITICAL FIX: The function now assumes the number is valid if ITI says it is, 
     * and only applies carrier/location logic for known countries.
     */
    function simulateNumVerifyResponse(code, number, intlFormat) {
        // --- 1. DEFAULT RESPONSE (Assumed Valid since ITI checked it) ---
        let response = {
            valid: true, // ITI ensures structural validity
            number: number,
            local_format: intlFormat,
            international_format: intlFormat,
            country_prefix: `+${iti.getSelectedCountryData().dialCode}`,
            country_code: code,
            country_name: iti.getSelectedCountryData().name,
            location: 'Global Region',
            carrier: 'International Network',
            line_type: 'mobile'
        };

        const numPrefix = number.substring(0, 3); 

        // --- 2. ENHANCED LOGIC FOR KNOWN COUNTRIES (US/CA/PH) ---
        if (code === 'US' || code === 'CA') {
            response.country_name = (code === 'US') ? 'United States of America' : 'Canada';
            response.location = 'North America';
            response.carrier = (numPrefix < '500') ? 'Verizon Wireless' : 'T-Mobile USA / Bell Canada';
            // Example of US formatting, ITI handles the true formatting
            response.international_format = intlFormat; 
        } else if (code === 'PH') {
            response.country_name = 'Philippines';
            response.location = 'Metro Manila';
            response.carrier = (['907', '908', '909', '910', '912', '918', '919', '920', '921', '928', '929', '930', '939', '946', '947', '948', '949', '950', '951', '989', '998', '999'].includes(numPrefix)) 
                               ? 'SMART Communications' 
                               : 'Globe Telecom / DITO';
            response.international_format = intlFormat;
        }

        // --- 3. FINAL VALIDATION (Only relevant if ITI's validation was poor, but kept for robustness) ---
        // If ITI says it's valid, we trust it. If you want to enforce strict 10-digit, 
        // you would add: `if ((code === 'US' || code === 'PH') && number.length !== 10) { response.valid = false; }`
        
        return response;
    }

    function showLoadingState() {
        // Reset styles and set text to loading
        for (const key in resultElements) {
            resultElements[key].textContent = 'Processing...';
            resultElements[key].className = 'result-value text-info-neon';
        }
    }

    function updateResultsPanel(data) {
        const isValid = data.valid;
        resultElements.valid.textContent = isValid ? 'YES' : 'NO';
        resultElements.valid.className = isValid ? 'result-value text-success-neon' : 'result-value text-danger-neon';

        resultElements.carrier.textContent = data.carrier || 'N/A';
        resultElements.country.textContent = data.country_name || data.country_code || 'N/A';
        resultElements.location.textContent = data.location || 'N/A';
        
        // Always display the full international format
        resultElements.international.textContent = data.international_format || 'N/A';
        resultElements.international.className = isValid ? 'result-value text-info-neon' : 'result-value';

        resultElements.carrier.className = 'result-value';
        resultElements.location.className = 'result-value';
        resultElements.country.className = 'result-value';
    }

    function displayError(message) {
        // Display a clear error message in the results panel area
        const errorHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading text-danger-neon">Validation Failed</h4>
                    <p class="text-light">${message}</p>
                    <hr>
                    <p class="mb-3 text-light">Please check the number format and selected country, then try again.</p>
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
    