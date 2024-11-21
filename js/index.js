document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section, .hero');
    const navLinks = document.querySelectorAll('.nav ul li a');
    
    // Tạo element gạch chân
    const underline = document.createElement('div');
    underline.classList.add('nav-underline');
    document.querySelector('.nav ul').appendChild(underline);

    // Hàm cập nhật vị trí gạch chân
    function moveUnderline(link) {
        const linkRect = link.getBoundingClientRect();
        const navRect = document.querySelector('.nav ul').getBoundingClientRect();
        
        underline.style.width = `${linkRect.width}px`;
        underline.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
    }

    // Xử lý scroll
    function onScroll() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                currentSection = section.getAttribute('id');
            }
        });

        // Cập nhật active link và di chuyển gạch chân
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if ((currentSection === 'Home' && href === '#') || 
                (href === `#${currentSection}`)) {
                moveUnderline(link);
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Xử lý click
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            moveUnderline(this);

            const href = this.getAttribute('href');
            if (href === '#') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Thêm CSS cho gạch chân
    const style = document.createElement('style');
    style.textContent = `
        .nav ul {
            position: relative;
        }
        .nav-underline {
            position: absolute;
            bottom: -5px;
            left: 0;
            height: 2px;
            background-color: black;
            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        }
    `;
    document.head.appendChild(style);
});
