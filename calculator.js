
        class Calculator {
            constructor() {
                // Initialize calculator state
                this.currentValue = '0';
                this.previousValue = null;
                this.operator = null;
                this.waitingForNewValue = false;
                this.memory = 0;
                this.history = '';
                this.mode = 'basic';
                
                // Cache DOM elements
                this.display = document.getElementById('display');
                this.historyDisplay = document.getElementById('history');
                this.memoryIndicator = document.getElementById('memoryIndicator');
                this.advancedFunctions = document.getElementById('advancedFunctions');
                
                // Initialize keyboard support
                this.initKeyboard();
                
                // Update display
                this.updateDisplay();
            }

            /**
             * Initialize keyboard event listeners
             */
            initKeyboard() {
                document.addEventListener('keydown', (e) => {
                    e.preventDefault();
                    
                    // Numbers
                    if (e.key >= '0' && e.key <= '9') {
                        this.inputNumber(e.key);
                    }
                    // Operators
                    else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
                        this.setOperator(e.key);
                    }
                    // Decimal point
                    else if (e.key === '.' || e.key === ',') {
                        this.inputDecimal();
                    }
                    // Equals
                    else if (e.key === 'Enter' || e.key === '=') {
                        this.calculate();
                    }
                    // Clear
                    else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
                        this.clear();
                    }
                    // Backspace
                    else if (e.key === 'Backspace') {
                        this.backspace();
                    }
                    // Percentage
                    else if (e.key === '%') {
                        this.percentage();
                    }
                });
            }

            /**
             * Toggle between basic and advanced calculator modes
             */
            toggleMode(mode) {
                this.mode = mode;
                
                // Update mode buttons
                const modeBtns = document.querySelectorAll('.mode-btn');
                modeBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.textContent.toLowerCase() === mode);
                });
                
                // Show/hide advanced functions
                if (mode === 'advanced') {
                    this.advancedFunctions.classList.add('show');
                } else {
                    this.advancedFunctions.classList.remove('show');
                }
            }

            /**
             * Handle number input
             */
            inputNumber(num) {
                // Limit input length
                if (this.currentValue.replace(/[^0-9]/g, '').length >= 15) {
                    this.showError('Maximum digits reached');
                    return;
                }

                if (this.waitingForNewValue) {
                    this.currentValue = num;
                    this.waitingForNewValue = false;
                } else {
                    this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
                }
                
                this.updateDisplay();
            }

            /**
             * Handle decimal point input
             */
            inputDecimal() {
                if (this.waitingForNewValue) {
                    this.currentValue = '0.';
                    this.waitingForNewValue = false;
                    this.updateDisplay();
                    return;
                }

                if (!this.currentValue.includes('.')) {
                    this.currentValue += '.';
                    this.updateDisplay();
                }
            }

            /**
             * Set the current operator
             */
            setOperator(op) {
                if (this.previousValue !== null && !this.waitingForNewValue) {
                    this.calculate();
                }

                this.previousValue = parseFloat(this.currentValue);
                this.operator = op;
                this.waitingForNewValue = true;
                
                // Update history display
                this.history = `${this.formatNumber(this.previousValue)} ${this.getOperatorSymbol(op)}`;
                this.updateDisplay();
            }

            /**
             * Perform calculation based on current operator
             */
            calculate() {
                // If no operator is set, just return (nothing to calculate)
                if (this.operator === null) {
                    return;
                }

                // If waiting for new value and user presses equals, use previous value again
                const current = this.waitingForNewValue ? this.previousValue : parseFloat(this.currentValue);
                const previous = this.previousValue;
                let result;

                try {
                    switch(this.operator) {
                        case '+':
                            result = previous + current;
                            break;
                        case '-':
                            result = previous - current;
                            break;
                        case '*':
                            result = previous * current;
                            break;
                        case '/':
                            if (current === 0) {
                                throw new Error('Cannot divide by zero');
                            }
                            result = previous / current;
                            break;
                        default:
                            return;
                    }

                    // Check for overflow or invalid results
                    if (!isFinite(result)) {
                        throw new Error('Result is too large');
                    }

                    // Round to avoid floating point precision issues
                    result = Math.round(result * 1e10) / 1e10;

                    // Update history
                    this.history = `${this.formatNumber(previous)} ${this.getOperatorSymbol(this.operator)} ${this.formatNumber(current)} =`;
                    
                    this.currentValue = result.toString();
                    this.operator = null;
                    this.previousValue = null;
                    this.waitingForNewValue = true;

                } catch (error) {
                    this.showError(error.message);
                    return;
                }

                this.updateDisplay();
            }

            /**
             * Clear all values and reset calculator
             */
            clear() {
                this.currentValue = '0';
                this.previousValue = null;
                this.operator = null;
                this.waitingForNewValue = false;
                this.history = '';
                this.updateDisplay();
            }

            /**
             * Backspace - remove last digit
             */
            backspace() {
                if (this.waitingForNewValue) {
                    return;
                }

                if (this.currentValue.length > 1) {
                    this.currentValue = this.currentValue.slice(0, -1);
                } else {
                    this.currentValue = '0';
                }
                
                this.updateDisplay();
            }

            /**
             * Toggle sign of current value (positive/negative)
             */
            toggleSign() {
                const num = parseFloat(this.currentValue);
                this.currentValue = (-num).toString();
                this.updateDisplay();
            }

            /**
             * Calculate percentage
             */
            percentage() {
                const num = parseFloat(this.currentValue);
                
                if (this.previousValue !== null && this.operator) {
                    // Calculate percentage of previous value
                    this.currentValue = ((this.previousValue * num) / 100).toString();
                } else {
                    // Convert to percentage
                    this.currentValue = (num / 100).toString();
                }
                
                this.updateDisplay();
            }

            /**
             * Calculate square root
             */
            sqrt() {
                const num = parseFloat(this.currentValue);
                
                if (num < 0) {
                    this.showError('Cannot calculate square root of negative number');
                    return;
                }
                
                const result = Math.sqrt(num);
                this.history = `√${this.formatNumber(num)}`;
                this.currentValue = result.toString();
                this.waitingForNewValue = true;
                this.updateDisplay();
            }

            /**
             * Calculate square
             */
            square() {
                const num = parseFloat(this.currentValue);
                const result = num * num;
                this.history = `${this.formatNumber(num)}²`;
                this.currentValue = result.toString();
                this.waitingForNewValue = true;
                this.updateDisplay();
            }

            /**
             * Calculate reciprocal (1/x)
             */
            reciprocal() {
                const num = parseFloat(this.currentValue);
                
                if (num === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                
                const result = 1 / num;
                this.history = `1/${this.formatNumber(num)}`;
                this.currentValue = result.toString();
                this.waitingForNewValue = true;
                this.updateDisplay();
            }

            /**
             * Memory functions
             */
            memoryClear() {
                this.memory = 0;
                this.updateMemoryIndicator();
            }

            memoryRecall() {
                this.currentValue = this.memory.toString();
                this.waitingForNewValue = true;
                this.updateDisplay();
            }

            memoryAdd() {
                this.memory += parseFloat(this.currentValue);
                this.updateMemoryIndicator();
                this.waitingForNewValue = true;
            }

            memorySubtract() {
                this.memory -= parseFloat(this.currentValue);
                this.updateMemoryIndicator();
                this.waitingForNewValue = true;
            }

            /**
             * Update memory indicator
             */
            updateMemoryIndicator() {
                if (this.memory !== 0) {
                    this.memoryIndicator.textContent = `M: ${this.formatNumber(this.memory)}`;
                } else {
                    this.memoryIndicator.textContent = '';
                }
            }

            /**
             * Update the display with current value
             */
            updateDisplay() {
                const num = parseFloat(this.currentValue);
                
                // Format the number for display
                if (isNaN(num)) {
                    this.display.textContent = '0';
                } else {
                    this.display.textContent = this.formatNumber(num);
                }
                
                this.historyDisplay.textContent = this.history;
                this.display.classList.remove('error-display');
            }

            /**
             * Format number for display
             */
            formatNumber(num) {
                // Handle very large or very small numbers
                if (Math.abs(num) > 999999999999 || (Math.abs(num) < 0.000001 && num !== 0)) {
                    return num.toExponential(6);
                }
                
                // Regular formatting
                const str = num.toString();
                if (str.length > 12) {
                    return parseFloat(num.toPrecision(12)).toString();
                }
                return str;
            }

            /**
             * Get operator symbol for display
             */
            getOperatorSymbol(op) {
                const symbols = {
                    '+': '+',
                    '-': '−',
                    '*': '×',
                    '/': '÷'
                };
                return symbols[op] || op;
            }

            /**
             * Show error message
             */
            showError(message) {
                this.display.textContent = message;
                this.display.classList.add('error-display');
                this.display.parentElement.classList.add('shake');
                
                setTimeout(() => {
                    this.display.parentElement.classList.remove('shake');
                    this.clear();
                }, 1500);
            }
        }

        // Initialize calculator
        const calculator = new Calculator();