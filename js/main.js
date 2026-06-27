document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       PRELOADER & SCROLL LOCK
       ========================================================================== */
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('loader-progress');
    
    // Simulate loading
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    initAnimations(); // Trigger initial scroll reveals
                }, 500);
            }, 500);
        }
    }, 150);

    /* ==========================================================================
       CUSTOM CURSOR & MAGNETIC BUTTONS
       ========================================================================== */
    const cursor = document.getElementById('custom-cursor');
    const trail = document.getElementById('cursor-trail');
    const spotlight = document.getElementById('spotlight');
    
    // Check if device has mouse
    const hasMouse = matchMedia('(pointer:fine)').matches;
    
    if (hasMouse) {
        document.addEventListener('mousemove', (e) => {
            // Update custom cursor
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
            
            // Trail lag effect
            setTimeout(() => {
                trail.style.left = `${e.clientX}px`;
                trail.style.top = `${e.clientY}px`;
            }, 50);
            
            // Spotlight effect in hero
            const heroSection = document.getElementById('home');
            const heroRect = heroSection.getBoundingClientRect();
            if (e.clientY <= heroRect.bottom && e.clientY >= heroRect.top) {
                spotlight.style.opacity = '1';
                spotlight.style.left = `${e.clientX}px`;
                spotlight.style.top = `${e.clientY}px`;
            } else {
                spotlight.style.opacity = '0';
            }
        });

        // Hover effects on clickable elements
        const clickables = document.querySelectorAll('a, button, .timeline-item, .project-card, .hex-item, .cert-card');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                trail.style.transform = 'translate(-50%, -50%) scale(1.5)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                trail.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });

        // Magnetic Buttons
        const magneticBtns = document.querySelectorAll('.magnetic-btn');
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate(0px, 0px)`;
            });
        });
    }

    /* ==========================================================================
       RIPPLE EFFECT
       ========================================================================== */
    const rippleBtns = document.querySelectorAll('.ripple');
    rippleBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.background = 'rgba(255,255,255,0.3)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.pointerEvents = 'none';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.width = '0';
            ripple.style.height = '0';
            
            const animation = ripple.animate([
                { width: '0', height: '0', opacity: 0.5 },
                { width: '500px', height: '500px', opacity: 0 }
            ], {
                duration: 600,
                easing: 'ease-out'
            });
            
            this.appendChild(ripple);
            animation.onfinish = () => ripple.remove();
        });
    });

    /* ==========================================================================
       NAVIGATION & SCROLL EFFECTS
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scroll-progress');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        // Navbar glass effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Scroll progress bar
        const totalScroll = document.body.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalScroll) * 100;
        scrollProgress.style.width = `${progress}%`;
        
        // Active section highlighting
        const sections = document.querySelectorAll('section');
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinkItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Parallax effect for cinematic titles
        document.querySelectorAll('.cinematic-title').forEach(title => {
            const titleRect = title.getBoundingClientRect();
            if(titleRect.top < window.innerHeight && titleRect.bottom > 0) {
                const scrolled = (window.innerHeight - titleRect.top) * 0.15;
                title.style.transform = `translateY(${50 - scrolled}px)`;
            }
        });
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close mobile menu on link click
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ==========================================================================
       SCROLL REVEAL ANIMATIONS
       ========================================================================== */
    function initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger counters if it's the stats section
                    if (entry.target.classList.contains('stats-container')) {
                        const counters = entry.target.querySelectorAll('.counter');
                        counters.forEach(counter => {
                            const target = +counter.getAttribute('data-target');
                            const increment = target / 50; // Adjust speed here
                            
                            let current = 0;
                            const updateCounter = () => {
                                current += increment;
                                if (current < target) {
                                    counter.innerText = Math.ceil(current);
                                    requestAnimationFrame(updateCounter);
                                } else {
                                    counter.innerText = target;
                                }
                            };
                            updateCounter();
                        });
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    /* ==========================================================================
       TYPING EFFECT (HERO SECTION)
       ========================================================================== */
    const typeWriterElement = document.getElementById('typewriter-text');
    const titles = [
        "AI & ML Engineer",
        "Generative AI Specialist",
        "Deep Learning Enthusiast",
        "Building Intelligent Systems"
    ];
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeWriter() {
        const currentTitle = titles[titleIndex];
        
        if (isDeleting) {
            typeWriterElement.innerText = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typeWriterElement.innerText = currentTitle.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 150;
        }

        if (!isDeleting && charIndex === currentTitle.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end of word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            typeSpeed = 500; // Pause before new word
        }

        setTimeout(typeWriter, typeSpeed);
    }
    
    // Start typing effect slightly after load
    setTimeout(typeWriter, 1000);

    /* ==========================================================================
       3D TILT EFFECT (PROJECT CARDS)
       ========================================================================== */
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    if (hasMouse) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const tiltX = ((y - centerY) / centerY) * -10; // Max tilt deg
                const tiltY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                card.style.transition = 'transform 0.5s ease';
            });
            
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'none';
            });
        });
    }

    /* ==========================================================================
       CAROUSEL DRAG/SWIPE SUPPORT
       ========================================================================== */
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselTrack = document.querySelector('.carousel-track');
    let isDown = false;
    let startX;
    let scrollLeft;

    if (carouselContainer) {
        carouselContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            carouselContainer.style.cursor = 'grabbing';
            // Pause animation
            carouselTrack.style.animationPlayState = 'paused';
            startX = e.pageX - carouselContainer.offsetLeft;
            scrollLeft = carouselContainer.scrollLeft;
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            isDown = false;
            carouselContainer.style.cursor = 'grab';
            carouselTrack.style.animationPlayState = 'running';
        });
        
        carouselContainer.addEventListener('mouseup', () => {
            isDown = false;
            carouselContainer.style.cursor = 'grab';
            carouselTrack.style.animationPlayState = 'running';
        });
        
        carouselContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carouselContainer.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            carouselContainer.scrollLeft = scrollLeft - walk;
        });
        
        // Touch events for mobile
        carouselContainer.addEventListener('touchstart', (e) => {
            isDown = true;
            carouselTrack.style.animationPlayState = 'paused';
            startX = e.touches[0].pageX - carouselContainer.offsetLeft;
            scrollLeft = carouselContainer.scrollLeft;
        });
        carouselContainer.addEventListener('touchend', () => {
            isDown = false;
            carouselTrack.style.animationPlayState = 'running';
        });
        carouselContainer.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - carouselContainer.offsetLeft;
            const walk = (x - startX) * 2;
            carouselContainer.scrollLeft = scrollLeft - walk;
        });
    }

    /* ==========================================================================
       INTERACTIVE TERMINAL EASTER EGG
       ========================================================================== */
    const terminalToggle = document.getElementById('terminal-toggle');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const termClose = document.getElementById('term-close');
    const termInput = document.getElementById('terminal-input');
    const termBody = document.getElementById('terminal-body');
    
    // Toggle terminal
    terminalToggle.addEventListener('click', () => {
        terminalOverlay.classList.remove('hidden');
        termInput.focus();
    });
    
    termClose.addEventListener('click', () => {
        terminalOverlay.classList.add('hidden');
    });

    const commands = {
        'help': 'Available commands: about, skills, projects, contact, clear, sudo hire jagannadharao',
        'about': 'Jalla Jagannadharao - AI & ML Engineer based in Visakhapatnam, India. Passionate about RAG, GenAI, and Multimodal systems.',
        'skills': 'Python, SQL, Java, TensorFlow, Scikit-Learn, Docker, FastAPI, RAG, GenAI, HuggingFace',
        'projects': '1. Multimodal Fake News Detection\n2. Autonomous AI Research Agent\n3. Employee Salary Prediction',
        'contact': 'Email: jallajagannadharao@gmail.com\nLinkedIn: linkedin.com/in/jallajagannadharao\nGitHub: github.com/jagannadharao8',
        'sudo hire jagannadharao': 'Access Granted. Initializing onboarding sequence... (Just kidding, but you should definitely email me!)'
    };

    termInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const cmd = this.value.trim().toLowerCase();
            this.value = '';
            
            // Print user command
            const cmdDiv = document.createElement('div');
            cmdDiv.innerHTML = `<span class="prompt">guest@jagannadharao:~$</span> ${cmd}`;
            termBody.insertBefore(cmdDiv, this.parentElement);
            
            // Process command
            if (cmd === 'clear') {
                const nodesToRemove = [];
                for(let i=2; i < termBody.children.length - 1; i++) {
                    nodesToRemove.push(termBody.children[i]);
                }
                nodesToRemove.forEach(node => node.remove());
            } else if (cmd === '') {
                // Do nothing
            } else {
                const responseDiv = document.createElement('div');
                if (commands[cmd]) {
                    responseDiv.innerText = commands[cmd];
                    responseDiv.style.color = '#00ff99';
                } else {
                    responseDiv.innerText = `Command not found: ${cmd}. Type 'help' for available commands.`;
                    responseDiv.style.color = '#ff5f56';
                }
                responseDiv.style.marginBottom = '10px';
                responseDiv.style.whiteSpace = 'pre-wrap';
                termBody.insertBefore(responseDiv, this.parentElement);
            }
            
            // Auto scroll to bottom
            termBody.scrollTop = termBody.scrollHeight;
        }
    });

    // Keyboard shortcut for terminal (Backtick `)
    document.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~') {
            e.preventDefault();
            terminalOverlay.classList.toggle('hidden');
            if(!terminalOverlay.classList.contains('hidden')) {
                termInput.focus();
            }
        }
    });

    /* ==========================================================================
       3D PARTICLE NEURAL NETWORK (HERO BACKGROUND)
       ========================================================================== */
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Mouse object
        const mouse = { x: null, y: null, radius: 150 };
        
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });
        
        class Particle {
            constructor(x, y, dx, dy, size) {
                this.x = x;
                this.y = y;
                this.dx = dx;
                this.dy = dy;
                this.size = size;
                this.baseX = this.x;
                this.baseY = this.y;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 255, 153, 0.8)';
                ctx.fill();
            }
            
            update() {
                // Interaction with mouse
                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * 5;
                    let directionY = forceDirectionY * force * 5;
                    
                    if (distance < mouse.radius) {
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        if (this.x !== this.baseX) {
                            let dx = this.x - this.baseX;
                            this.x -= dx / 10;
                        }
                        if (this.y !== this.baseY) {
                            let dy = this.y - this.baseY;
                            this.y -= dy / 10;
                        }
                    }
                } else {
                    // Floating movement when mouse is away
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 20;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 20;
                    }
                }

                // Normal particle movement
                this.x += this.dx;
                this.y += this.dy;
                
                // Update base position to allow continuous floating
                this.baseX += this.dx;
                this.baseY += this.dy;

                // Bounce off edges
                if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
                if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;
                
                this.draw();
            }
        }
        
        function initParticles() {
            particlesArray = [];
            let numberOfParticles = (canvas.width * canvas.height) / 9000;
            // Reduce particles on mobile for performance
            if(window.innerWidth < 768) numberOfParticles = numberOfParticles / 2;
            
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
                let dx = (Math.random() * 0.5) - 0.25;
                let dy = (Math.random() * 0.5) - 0.25;
                particlesArray.push(new Particle(x, y, dx, dy, size));
            }
        }
        
        function connectParticles() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                                   ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                                   
                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(0, 255, 153, ${opacityValue * 0.2})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        function animateParticles() {
            requestAnimationFrame(animateParticles);
            
            // Optimization: Skip rendering if Hero section is out of viewport
            if (window.scrollY > window.innerHeight + 100) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connectParticles();
        }
        
        initParticles();
        animateParticles();
    }
});
