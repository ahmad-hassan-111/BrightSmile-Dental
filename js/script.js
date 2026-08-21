// =====================================================
// BRIGHTSMILE MAIN WEBSITE JAVASCRIPT
// =====================================================


// =====================================================
// MOBILE MENU
// =====================================================

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {

        navLinks.classList.toggle("active");

    });


    navLinks.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("active");

        });

    });

}


// =====================================================
// FADE-IN ANIMATION
// =====================================================


   const fadeElements =
document.querySelectorAll(
".hero, .hero-content, .section-title, .why-card, .service-card, .doctor-card, .testimonial-card, .stat-box, .gallery-img, .contact-card, .appointment-container"
);

if (fadeElements.length > 0) {

    const fadeObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.15
            }
        );


    fadeElements.forEach(element => {

        fadeObserver.observe(element);

    });

}


// =====================================================
// NUMBER COUNTER
// =====================================================

const counters =
    document.querySelectorAll(".counter");


function startCounter(counter) {

    const target =
        Number(
            counter.dataset.target
        );


    const suffix =
        counter.dataset.suffix || "";


    if (!target) {

        counter.textContent =
            "0" + suffix;

        return;

    }


    let current = 0;


   const duration = 1200;

    const startTime =
        performance.now();


    function updateCounter(currentTime) {

        const elapsed =
            currentTime - startTime;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        const easedProgress =
            1 - Math.pow(
                1 - progress,
                3
            );


        current =
            Math.floor(
                target * easedProgress
            );


        counter.textContent =
            current + suffix;


        if (progress < 1) {

            requestAnimationFrame(
                updateCounter
            );

        } else {

            counter.textContent =
                target + suffix;

        }

    }


    requestAnimationFrame(
        updateCounter
    );

}


if (counters.length > 0) {

    const counterObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        startCounter(
                            entry.target
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.5
            }
        );


    counters.forEach(counter => {

        counterObserver.observe(counter);

    });

}


// =====================================================
// GALLERY LIGHTBOX
// =====================================================

const galleryImages =
    document.querySelectorAll(
        ".gallery-img"
    );

const lightbox =
    document.querySelector(
        ".lightbox"
    );

const lightboxImage =
    document.getElementById(
        "lightbox-img"
    );

const closeLightbox =
    document.querySelector(
        ".close-lightbox"
    );


if (
    galleryImages.length > 0 &&
    lightbox &&
    lightboxImage
) {

    galleryImages.forEach(image => {

        image.addEventListener(
            "click",
            () => {

                lightboxImage.src =
                    image.src;

                lightboxImage.alt =
                    image.alt;

                lightbox.classList.add(
                    "active"
                );

                document.body.style.overflow =
                    "hidden";

            }
        );

    });

}


function closeGalleryLightbox() {

    if (!lightbox) {
        return;
    }


    lightbox.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "auto";

}


if (closeLightbox) {

    closeLightbox.addEventListener(
        "click",
        closeGalleryLightbox
    );

}


if (lightbox) {

    lightbox.addEventListener(
        "click",
        event => {

            if (
                event.target === lightbox
            ) {

                closeGalleryLightbox();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            lightbox &&
            lightbox.classList.contains(
                "active"
            )
        ) {

            closeGalleryLightbox();

        }

    }
);


// =====================================================
// APPOINTMENT FORM
// =====================================================

const appointmentForm =
    document.getElementById(
        "appointmentForm"
    );

const successMessage =
    document.getElementById(
        "successMessage"
    );

const closeSuccess =
    document.getElementById(
        "closeSuccess"
    );


const API_URL = "https://bright-smile-dental-smoky.vercel.app/api";

if (appointmentForm) {

    appointmentForm.addEventListener(
        "submit",
        async event => {

            // VERY IMPORTANT:
            // Prevent browser from refreshing the page.

            event.preventDefault();


            const inputs =
                appointmentForm.querySelectorAll(
                    "input"
                );

            const select =
                appointmentForm.querySelector(
                    "select"
                );

            const textarea =
                appointmentForm.querySelector(
                    "textarea"
                );


            const name =
                inputs[0]?.value.trim() || "";

            const phone =
                inputs[1]?.value.trim() || "";

            const email =
                inputs[2]?.value.trim() || "";

            const date =
                inputs[3]?.value || "";

            const time =
                inputs[4]?.value || "";

            const service =
                select?.value || "";

            const message =
                textarea?.value.trim() || "";


            const submitButton =
                appointmentForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Sending...";

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/appointments`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                phone: phone,

                                email: email,

                                date: date,

                                time: time,

                                service: service,

                                message: message

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Could not submit appointment."
                    );

                }


                // Clear the form

                appointmentForm.reset();


                // Show success message

                if (successMessage) {

                    successMessage.classList.add(
                        "show"
                    );

                }


            } catch (error) {

                console.error(
                    "Appointment error:",
                    error
                );


                alert(
                    "Could not submit the appointment. Please make sure the FastAPI backend is running."
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Book Appointment";

                }

            }

        }
    );

}


// =====================================================
// CLOSE SUCCESS MESSAGE
// =====================================================

if (closeSuccess) {

    closeSuccess.addEventListener(
        "click",
        () => {

            if (successMessage) {

                successMessage.classList.remove(
                    "show"
                );

            }

        }
    );

}


// =====================================================
// BACK TO TOP
// =====================================================

const backToTop =
    document.getElementById(
        "backToTop"
    );


if (backToTop) {

    window.addEventListener(
        "scroll",
        () => {

            if (
                window.scrollY > 300
            ) {

                backToTop.classList.add(
                    "show"
                );

            } else {

                backToTop.classList.remove(
                    "show"
                );

            }

        }
    );


    backToTop.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


// =====================================================
// WHATSAPP BUTTON
// =====================================================

const whatsappButton =
    document.querySelector(
        ".whatsapp-btn"
    );


if (whatsappButton) {

    whatsappButton.addEventListener(
        "click",
        () => {

            const phoneNumber =
                "15551234567";


            const message =
                encodeURIComponent(
                    "Hello BrightSmile! I would like to book an appointment."
                );


            whatsappButton.href =
                `https://wa.me/${phoneNumber}?text=${message}`;

        }
    );

}


// =====================================================
// END OF MAIN WEBSITE JAVASCRIPT
// =====================================================
