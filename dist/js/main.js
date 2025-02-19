document.addEventListener('DOMContentLoaded', () => {
  /**
   * Burger menu
   */
  const burger = document.querySelector('.js-burger');
  const headerNav = document.querySelector('.header__nav');

  burger.addEventListener('click', () => {
    burger.classList.toggle('is-active');
    headerNav.classList.toggle('is-active');

    // lock scroll when is active
    document.body.classList.toggle('lock-scroll');
  });

  /**
   * Footer menu toggle
   */
  const footerNavCol = document.querySelectorAll('.footer__nav-col');

  footerNavCol.forEach((nav) => {
    nav.querySelector('.footer__nav-title').addEventListener('click', () => {
      nav.classList.toggle('is-active');
    });
  });
});
