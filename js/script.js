// ===== NAVIGATION TOGGLE =====
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
});

// ===== BÀI TẬP 1: DANH SÁCH SẢN PHẨM VÀ TÌM KIẾM =====

// Mảng sản phẩm (ít nhất 5 sản phẩm)
const products = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        description: "Điện thoại cao cấp với chip A17 Pro, camera 48MP",
        price: 34990000,
        icon: "fa-mobile-screen"
    },
    {
        id: 2,
        name: "MacBook Pro M3",
        description: "Laptop mạnh mẽ với chip M3, màn hình Retina 14 inch",
        price: 49990000,
        icon: "fa-laptop"
    },
    {
        id: 3,
        name: "AirPods Pro 2",
        description: "Tai nghe không dây với chống ồn chủ động",
        price: 6990000,
        icon: "fa-headphones"
    },
    {
        id: 4,
        name: "iPad Air M2",
        description: "Máy tính bảng mỏng nhẹ với chip M2, hỗ trợ Apple Pencil",
        price: 18990000,
        icon: "fa-tablet-screen-button"
    },
    {
        id: 5,
        name: "Apple Watch Ultra 2",
        description: "Đồng hồ thông minh cao cấp, chống nước 100m",
        price: 23990000,
        icon: "fa-clock"
    },
    {
        id: 6,
        name: "Samsung Galaxy S24 Ultra",
        description: "Flagship Android với camera 200MP và S Pen",
        price: 33990000,
        icon: "fa-mobile"
    },
    {
        id: 7,
        name: "Sony WH-1000XM5",
        description: "Tai nghe over-ear chống ồn hàng đầu thế giới",
        price: 8990000,
        icon: "fa-headphones-simple"
    }
];

/**
 * LOGIC TƯ DUY - XỬ LÝ INPUT VÀ BẢO MẬT:
 * 
 * 1. Sanitize Input: Loại bỏ các ký tự đặc biệt có thể gây injection
 *    - Sử dụng hàm sanitizeInput() để escape HTML entities
 *    - Chỉ cho phép chữ cái, số, khoảng trắng và một số ký tự an toàn
 * 
 * 2. Tìm kiếm không phân biệt hoa thường:
 *    - Chuyển cả input và tên sản phẩm về lowercase trước khi so sánh
 *    - Sử dụng includes() để tìm kiếm partial match
 * 
 * 3. Tối ưu tìm kiếm:
 *    - Trim khoảng trắng đầu cuối
 *    - Filter trực tiếp trên mảng (O(n) complexity)
 *    - Debounce có thể thêm nếu cần thiết cho UX tốt hơn
 */

// Hàm sanitize input để tránh XSS injection
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Hàm format giá tiền VND
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Hàm render sản phẩm
function renderProducts(productList) {
    const container = document.getElementById('product-container');
    if (!container) return;

    if (productList.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-face-sad-tear"></i>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Vui lòng thử từ khóa khác</p>
            </div>
        `;
        return;
    }

    container.innerHTML = productList.map(product => `
        <div class="product-card" data-testid="product-card-${product.id}">
            <div class="product-image">
                <i class="fa-solid ${product.icon}"></i>
            </div>
            <div class="product-info">
                <h3 class="product-name">${sanitizeInput(product.name)}</h3>
                <p class="product-description">${sanitizeInput(product.description)}</p>
                <p class="product-price">${formatPrice(product.price)}</p>
            </div>
        </div>
    `).join('');
}

// Hàm tìm kiếm sản phẩm
function searchProducts(keyword) {
    // Sanitize và chuẩn hóa input
    const sanitizedKeyword = sanitizeInput(keyword.trim().toLowerCase());
    
    if (sanitizedKeyword === '') {
        return products;
    }

    // Tìm kiếm không phân biệt hoa thường
    return products.filter(product => 
        product.name.toLowerCase().includes(sanitizedKeyword)
    );
}

// Khởi tạo trang sản phẩm
function initProductPage() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (!searchInput || !searchBtn) return;

    // Render tất cả sản phẩm ban đầu
    renderProducts(products);

    // Xử lý sự kiện tìm kiếm
    searchBtn.addEventListener('click', function() {
        const results = searchProducts(searchInput.value);
        renderProducts(results);
    });

    // Tìm kiếm khi nhấn Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const results = searchProducts(searchInput.value);
            renderProducts(results);
        }
    });

    // Real-time search (debounced)
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const results = searchProducts(searchInput.value);
            renderProducts(results);
        }, 300);
    });
}

// ===== BÀI TẬP 2: FORM ĐĂNG KÝ =====

/**
 * LOGIC TƯ DUY - XỬ LÝ FORM VÀ BẢO MẬT:
 * 
 * 1. Xử lý sự kiện submit:
 *    - Sử dụng preventDefault() để ngăn form submit mặc định
 *    - Validate từng field trước khi lưu
 *    - Hiển thị lỗi ngay khi field invalid
 * 
 * 2. Validation:
 *    - Email: Sử dụng regex pattern chuẩn RFC 5322
 *    - Password: Kiểm tra độ dài >= 8, có chữ hoa, chữ thường, số
 *    - Checkbox: Bắt buộc phải đồng ý điều khoản
 * 
 * 3. Bảo mật dữ liệu LocalStorage:
 *    - KHÔNG lưu mật khẩu dạng plain text trong production
 *    - Ở đây demo nên hash đơn giản bằng btoa (Base64)
 *    - Production nên dùng bcrypt hoặc PBKDF2 ở server-side
 *    - LocalStorage không mã hóa, dễ bị XSS attack
 *    - Khuyến nghị: Chỉ lưu non-sensitive data ở client
 */

// Regex patterns
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Hàm validate email
function validateEmail(email) {
    return emailRegex.test(email);
}

// Hàm validate password
function validatePassword(password) {
    return passwordRegex.test(password);
}

// Hàm hiển thị/ẩn lỗi
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(inputId + '-error');
    if (input && errorEl) {
        input.classList.add('error');
        input.classList.remove('success');
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
}

function hideError(inputId) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(inputId + '-error');
    if (input && errorEl) {
        input.classList.remove('error');
        input.classList.add('success');
        errorEl.classList.remove('show');
    }
}

// Hàm "hash" password đơn giản (CHỈ DÙNG CHO DEMO)
// Production: Sử dụng bcrypt/PBKDF2 ở server
function simpleHash(password) {
    return btoa(password);
}

// Khởi tạo form đăng ký
function initRegistrationForm() {
    const form = document.getElementById('registration-form');
    const alertSuccess = document.getElementById('alert-success');
    const alertError = document.getElementById('alert-error');

    if (!form) return;

    // Real-time validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const termsInput = document.getElementById('terms');

    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            if (this.value.trim().length < 2) {
                showError('name', 'Tên phải có ít nhất 2 ký tự');
            } else {
                hideError('name');
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (!validateEmail(this.value)) {
                showError('email', 'Email không hợp lệ');
            } else {
                hideError('email');
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            if (!validatePassword(this.value)) {
                showError('password', 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số');
            } else {
                hideError('password');
            }
        });
    }

    // Form submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Ngăn form submit mặc định

        let isValid = true;

        // Hide all alerts first
        if (alertSuccess) alertSuccess.classList.remove('show');
        if (alertError) alertError.classList.remove('show');

        // Validate name
        const name = nameInput ? nameInput.value.trim() : '';
        if (name.length < 2) {
            showError('name', 'Tên phải có ít nhất 2 ký tự');
            isValid = false;
        } else {
            hideError('name');
        }

        // Validate email
        const email = emailInput ? emailInput.value.trim() : '';
        if (!validateEmail(email)) {
            showError('email', 'Email không hợp lệ');
            isValid = false;
        } else {
            hideError('email');
        }

        // Validate password
        const password = passwordInput ? passwordInput.value : '';
        if (!validatePassword(password)) {
            showError('password', 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số');
            isValid = false;
        } else {
            hideError('password');
        }

        // Validate terms
        const termsAccepted = termsInput ? termsInput.checked : false;
        if (!termsAccepted) {
            showError('terms', 'Bạn phải đồng ý với điều khoản sử dụng');
            isValid = false;
        } else {
            hideError('terms');
        }

        if (isValid) {
            // Lưu vào LocalStorage
            const userData = {
                name: sanitizeInput(name),
                email: sanitizeInput(email),
                // Hash password đơn giản (DEMO ONLY)
                passwordHash: simpleHash(password),
                registeredAt: new Date().toISOString()
            };

            // Lấy danh sách users hiện có
            let users = JSON.parse(localStorage.getItem('registered_users') || '[]');
            
            // Kiểm tra email đã tồn tại
            if (users.some(u => u.email === userData.email)) {
                if (alertError) {
                    alertError.textContent = 'Email này đã được đăng ký!';
                    alertError.classList.add('show');
                }
                return;
            }

            users.push(userData);
            localStorage.setItem('registered_users', JSON.stringify(users));

            // Hiển thị thông báo thành công
            if (alertSuccess) {
                alertSuccess.textContent = 'Đăng ký thành công! Chào mừng ' + sanitizeInput(name);
                alertSuccess.classList.add('show');
            }

            // Reset form
            form.reset();
            
            // Remove success classes
            document.querySelectorAll('.form-control').forEach(el => {
                el.classList.remove('success', 'error');
            });
        } else {
            if (alertError) {
                alertError.textContent = 'Vui lòng kiểm tra lại thông tin!';
                alertError.classList.add('show');
            }
        }
    });
}

// ===== BÀI TẬP 3: ĐỒNG HỒ ĐẾM NGƯỢC =====

/**
 * LOGIC TƯ DUY - XỬ LÝ INTERVAL VÀ MEMORY LEAK:
 * 
 * 1. Tránh Memory Leak:
 *    - Luôn lưu reference của setInterval vào biến
 *    - clearInterval khi: pause, reset, hoặc component unmount
 *    - Sử dụng một interval duy nhất, không tạo nhiều interval
 * 
 * 2. Tích hợp với Domain/Hosting khi deploy:
 *    - Thời gian client có thể sai lệch do múi giờ, đồng hồ hệ thống
 *    - Giải pháp: Lấy timestamp từ server làm mốc (server-side timestamp)
 *    - Sử dụng Date.now() hoặc performance.now() cho độ chính xác
 *    - Có thể sync với NTP server hoặc API thời gian
 * 
 * 3. Xử lý edge cases:
 *    - Tab inactive: setInterval có thể bị throttle
 *    - Giải pháp: Lưu endTime và tính lại remainingTime mỗi tick
 *    - Sử dụng requestAnimationFrame cho animation mượt hơn
 */

let timerInterval = null;
let remainingSeconds = 10 * 60; // 10 phút = 600 giây
let isPaused = true;
let endTime = null;

// Hàm format thời gian MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Hàm cập nhật display
function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    const progressBar = document.getElementById('timer-progress-bar');
    
    if (display) {
        display.textContent = formatTime(remainingSeconds);
        
        // Thêm animation warning khi dưới 1 phút
        if (remainingSeconds < 60) {
            display.classList.add('warning');
        } else {
            display.classList.remove('warning');
        }
    }

    if (progressBar) {
        const percentage = (remainingSeconds / (10 * 60)) * 100;
        progressBar.style.width = percentage + '%';
    }
}

// Hàm hiển thị modal
function showModal() {
    const modal = document.getElementById('timer-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Hàm ẩn modal
function hideModal() {
    const modal = document.getElementById('timer-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Hàm tick - được gọi mỗi giây
function tick() {
    if (isPaused) return;

    // Tính remaining time dựa trên endTime (tránh lỗi khi tab inactive)
    const now = Date.now();
    remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
    
    updateTimerDisplay();

    if (remainingSeconds <= 0) {
        // Hết thời gian
        clearInterval(timerInterval);
        timerInterval = null;
        isPaused = true;
        showModal();
        updateButtonStates();
    }
}

// Hàm bắt đầu/tiếp tục đếm
function startTimer() {
    if (remainingSeconds <= 0) return;

    isPaused = false;
    endTime = Date.now() + (remainingSeconds * 1000);
    
    // Clear interval cũ trước khi tạo mới (tránh memory leak)
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(tick, 1000);
    updateButtonStates();
}

// Hàm tạm dừng
function pauseTimer() {
    isPaused = true;
    
    // Clear interval khi pause (tránh memory leak)
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    updateButtonStates();
}

// Hàm reset
function resetTimer() {
    // Clear interval (tránh memory leak)
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    isPaused = true;
    remainingSeconds = 10 * 60;
    endTime = null;
    
    updateTimerDisplay();
    updateButtonStates();
    hideModal();
}

// Hàm cập nhật trạng thái button
function updateButtonStates() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (startBtn && pauseBtn) {
        if (isPaused) {
            startBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
        } else {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-flex';
        }
    }
}

// Khởi tạo timer page
function initTimerPage() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (startBtn) {
        startBtn.addEventListener('click', startTimer);
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseTimer);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetTimer);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            hideModal();
            resetTimer();
        });
    }

    // Khởi tạo display
    updateTimerDisplay();
    updateButtonStates();
}

// ===== BÀI TẬP 14: MEMORY CARD FLIP GAME =====
function initMemoryGame() {
    const cards = document.querySelectorAll('.memory-card');
    const movesText = document.getElementById('memory-moves');
    const resetBtn = document.getElementById('memory-reset-btn');
    const board = document.getElementById('memory-game-board');

    if (!cards.length || !movesText || !resetBtn || !board) return;

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let matchedPairs = 0;
    const totalPairs = cards.length / 2;

    const updateMovesText = () => {
        movesText.textContent = moves.toString();
    };

    const resetTurn = () => {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    };

    const checkWin = () => {
        if (matchedPairs === totalPairs) {
            setTimeout(() => {
                alert('Chúc mừng! Bạn đã thắng sau ' + moves + ' lượt!');
            }, 300);
        }
    };

    function checkMatch() {
        const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        matchedPairs++;
        resetTurn();
        checkWin();
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetTurn();
        }, 800);
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flip');

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        moves++;
        updateMovesText();

        checkMatch();
    }

    const shuffle = () => {
        const shuffled = Array.from(cards).sort(() => 0.5 - Math.random());

        // Reset state
        moves = 0;
        matchedPairs = 0;
        updateMovesText();
        resetTurn();

        shuffled.forEach(card => {
            card.classList.remove('flip');
            card.removeEventListener('click', flipCard);
            card.addEventListener('click', flipCard);
            board.appendChild(card);
        });
    };

    // Khởi tạo game
    shuffle();

    // Reset game
    resetBtn.addEventListener('click', shuffle);
}

// ===== KHỞI TẠO TRANG =====
document.addEventListener('DOMContentLoaded', function() {
    // Xác định trang hiện tại và khởi tạo
    const path = window.location.pathname;
    
    if (path.includes('baitap01')) {
        initProductPage();
    } else if (path.includes('baitap02')) {
        initRegistrationForm();
    } else if (path.includes('baitap03')) {
        initTimerPage();
    } else if (path.includes('baitap14')) {
        initMemoryGame();
    }
});

// Clean up khi rời trang (tránh memory leak)
window.addEventListener('beforeunload', function() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
});
