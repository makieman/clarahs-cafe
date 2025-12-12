/*--------------------- Copyright (c) Restaurant and Catering -----------------------
[Master Javascript]
Project: Restaurant and Catering html
-------------------------------------------------------------------*/
(function ($) {
    "use strict";
    var Catering = {
        initialised: false,
        version: 1.0,
        mobile: false,
        ajaxMailUrl: 'ajaxmail.php', // Configuration variable for AJAX mail URL
        init: function () {
            if (!this.initialised) {
                this.initialised = true;
            } else {
                return;
            }
            /*-------------- Restaurant and Catering Functions Calling ---------------------------------------------------
            ------------------------------------------------------------------------------------------------*/

            this.loader();
            this.bottom_top();
            this.toggle_menu();
            this.menu_tab();
            this.team_slider();
            this.testi_slider();
            this.history_slider();
            this.gallery_grid();
            this.formValidation();
            this.copy_right();

        },

        /*-------------- Restaurant and Catering Functions Calling ---------------------------------------------------
        --------------------------------------------------------------------------------------------------*/

        /*-----------------------------------------------------
            Loader
        -----------------------------------------------------*/
        loader: function () {
            jQuery(window).on("load", function () {
                jQuery(".loader").fadeOut();
                jQuery(".spinner").delay(500).fadeOut("slow");
            });
        },


        /*-----------------------------------------------------
            Bottom To Top
        -----------------------------------------------------*/
        bottom_top: function () {
            if (jQuery("#button").length > 0) {
                var btn = jQuery("#button");
                var fixed = jQuery(".rac_header_wrapper");
                var debounce_timer;
                jQuery(window).scroll(function () {
                    if (debounce_timer) {
                        clearTimeout(debounce_timer);
                    }
                    debounce_timer = setTimeout(function () {
                        if (jQuery(window).scrollTop() > 200) {
                            btn.addClass("show");
                            fixed.addClass("fixed");
                        } else {
                            btn.removeClass("show");
                            fixed.removeClass("fixed");
                        }
                    }, 100);
                });
                btn.on("click", function (e) {
                    e.preventDefault();
                    jQuery("html, body").animate({
                        scrollTop: 0
                    }, "200");
                });
            }
        },

        /*-----------------------------------------------------
            Toggle Menu
        -----------------------------------------------------*/
        toggle_menu: function () {
            var toggleBtn = jQuery('.rac_toggle_btn');
            var navMenu = jQuery('.rac_nav_item > ul');
            var firstMenuItem = navMenu.find('li:first-child a');

            toggleBtn.attr({
                'aria-expanded': 'false',
                'aria-controls': 'main-nav'
            });
            navMenu.attr('id', 'main-nav');

            toggleBtn.on("click", function (e) {
                e.stopPropagation();
                jQuery("body").toggleClass("menu-open");
                var isExpanded = jQuery("body").hasClass("menu-open");
                toggleBtn.attr('aria-expanded', isExpanded);
                if (isExpanded) {
                    firstMenuItem.focus();
                }
            });

            jQuery('.rac_menu_wrapper').on("click", function (e) {
                e.stopPropagation();
            });

            jQuery('body').on("click", function () {
                jQuery("body").removeClass("menu-open");
                toggleBtn.attr('aria-expanded', 'false');
            });

            // Close menu with Escape key
            jQuery(document).on('keydown', function (e) {
                if (e.key === 'Escape' && jQuery("body").hasClass("menu-open")) {
                    jQuery("body").removeClass("menu-open");
                    toggleBtn.attr('aria-expanded', 'false');
                    toggleBtn.focus();
                }
            });

            // Make menu items focusable
            navMenu.find('a').attr('tabindex', '0');
        },

        /*-----------------------------------------------------
            Menus Tabs
        -----------------------------------------------------*/
        menu_tab: function () {
            jQuery('.rac_menu_tab li a').on('click', function (e) {
                e.preventDefault();
                var target = jQuery(this).attr('data-rel');
                jQuery('.rac_menu_tab li a').removeClass('active');
                jQuery(this).addClass('active');
                jQuery("#" + target).fadeIn('slow').siblings(".rac_tab_pane").hide();
                return false;
            });
        },

        /*-----------------------------------------------------
            Team Slider
        -----------------------------------------------------*/
        team_slider: function () {
            var swiper = new Swiper('.rac_chefs_slider .swiper', {
                slidesPerView: 3,
                spaceBetween: 30,
                loop: true,
                speed: 3000,
                autoplay: {
                    delay: 1500,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: ".rac_chefs_slider .swiper-pagination",
                    clickable: true,
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 4,
                        spaceBetween: 30,
                    },
                    992: {
                        slidesPerView: 3,
                        spaceBetween: 30,
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 30,
                    },
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 15,
                    }
                }
            });
        },

        /*-----------------------------------------------------
            Testimonials Slider
        -----------------------------------------------------*/
        testi_slider: function () {
            var swiper = new Swiper('.rac_testimonial_slider .swiper', {
                slidesPerView: 2,
                spaceBetween: 30,
                loop: true,
                speed: 3000,
                autoplay: {
                    delay: 1500,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: ".rac_testimonial_slider .swiper-pagination",
                    clickable: true,
                },
                breakpoints: {
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 30,
                    },
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 15,
                    }
                }
            });
        },

        /*-----------------------------------------------------
            History Slider
        -----------------------------------------------------*/
        history_slider: function () {
            var swiper = new Swiper(".rac_history_slider .swiper", {
                slidesPerView: 1,
                loop: true,
                spaceBetween: 10,
                speed: 3000,
                autoplay: {
                    delay: 1500,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: ".rac_history_slider .swiper-pagination",
                    clickable: true,
                    renderBullet: function (index, className) {
                        return '<span class="' + className + '">' + (new Date().getFullYear() - index) + "</span>";
                    },
                },
                breakpoints: {
                    1199: {
                        direction: "vertical",
                        spaceBetween: 30,
                    },
                    0: {
                        direction: "horizontal",
                    }
                }
            });
        },

        /*-----------------------------------------------------
            Gallery Grid
        -----------------------------------------------------*/
        gallery_grid: function () {
            var Shuffle = window.Shuffle;
            var container = document.querySelector('.rac_events_gallery');

            if (container) {
                var shuffleInstance = new Shuffle(container, {
                    itemSelector: '.grid-item'
                });

                // LightGallery integration
                jQuery("#gallery").lightGallery({
                    selector: '.grid-item',
                    mode: 'lg-fade',
                    cssEasing: 'cubic-bezier(0.25, 0, 0.25, 1)',
                });

                // Note: The current HTML doesn't have filter buttons for the gallery.
                // If you add them later, you can use the following code to handle filtering.
                document.querySelectorAll('.portfolio-filter li').forEach(function (button) {
                    button.addEventListener('click', function () {
                        // Remove active class from all buttons
                        document.querySelectorAll('.portfolio-filter li').forEach(function (btn) {
                            btn.classList.remove('active');
                        });
                        // Add active class to the clicked button
                        this.classList.add('active');

                        var group = this.getAttribute('data-group');
                        shuffleInstance.filter(group);
                    });
                });
            }
        },

        /*-----------------------------------------------------
            Form Validation
        -----------------------------------------------------*/

        formValidation: function () {
            // Object to hold different validation regular expressions
            var validation = {
                email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
                mobile: /^[\s()+-]*([0-9][\s()+-]*){6,20}$/
            };

            function checkRequire(formId, targetResp) {
                "use strict";
                targetResp.html('');
                var check = 0;
                jQuery('#er_msg').remove();
                var target = (typeof formId == 'object') ? jQuery(formId) : jQuery('#' + formId);
                target.find('input , textarea , select').each(function () {
                    if (jQuery(this).hasClass('require')) {
                        if (jQuery(this).val().trim() == '') {
                            check = 1;
                            jQuery(this).focus();
                            jQuery(this).parent('div').addClass('form_error');
                            targetResp.html('You missed out some fields.');
                            jQuery(this).addClass('error');
                            return false;
                        } else {
                            jQuery(this).removeClass('error');
                            jQuery(this).parent('div').removeClass('form_error');
                        }
                    }
                    if (jQuery(this).val().trim() != '') {
                        var valid = jQuery(this).attr('data-valid');
                        if (typeof valid != 'undefined') {
                            // Check if the validation type exists in our validation object
                            if (validation.hasOwnProperty(valid)) {
                                if (!validation[valid].test(jQuery(this).val().trim())) {
                                    jQuery(this).addClass('error');
                                    jQuery(this).focus();
                                    check = 1;
                                    targetResp.html(jQuery(this).attr('data-error'));
                                    return false;
                                } else {
                                    jQuery(this).removeClass('error');
                                }
                            }
                        }
                    }
                });
                return check;
            }
            jQuery(".submitForm").on('click', function () {
                var self = jQuery(this);
                var targetForm = self.closest('form');
                var errroTarget = targetForm.find('.response');
                var check = checkRequire(targetForm, errroTarget);

                if (check == 0) {
                    var formDetail = new FormData(targetForm[0]);
                    formDetail.append('form_type', self.attr('form-type'));
                    jQuery.ajax({
                        method: 'post',
                        url: Catering.ajaxMailUrl,
                        data: formDetail,
                        cache: false,
                        contentType: false,
                        processData: false
                    }).done(function (resp) {
                        if (resp == 1) {
                            targetForm.find('input').val('');
                            targetForm.find('textarea').val('');
                            errroTarget.html('<p style="color:green;">Mail has been sent successfully.</p>');
                        } else {
                            errroTarget.html('<p style="color:red;">Something went wrong please try again latter.</p>');
                        }
                    }).fail(function () {
                        errroTarget.html('<p style="color:red;">Something went wrong please try again latter.</p>');
                    });
                }
            });
        },

        /*-----------------------------------------------------
            Copy Right
        -----------------------------------------------------*/
        copy_right: function () {
            document.getElementById("copyYear").innerHTML = new Date().getFullYear();
        },

    };
    Catering.init();
})(jQuery);
const iframe = document.getElementById('bookingIframe');
const loader = document.getElementById('loader');

// When iframe loads, hide loader. If cross-origin, "load" still fires.
iframe.addEventListener('load', () => {
    loader.classList.add('hidden');
});

// If embedding blocked, the iframe may remain empty. Provide visual hint:
// After 6 seconds, if iframe height is small or still shows blank, show fallback button more prominently.
setTimeout(() => {
    // Heuristic: if the iframe contentWindow length can't be accessed (cross-origin) skip; we test by checking computed style
    const rect = iframe.getBoundingClientRect();
    if (rect.height < 200) {
        // show fallback more clearly (you can change behaviour)
        document.getElementById('openNewTab').classList.remove('btn-outline-primary');
        document.getElementById('openNewTab').classList.add('btn-primary');
    }
}, 6000);
