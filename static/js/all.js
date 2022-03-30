 var toggelButton = document.querySelector("#menu-bars");
 var toggelPage = document.querySelector('.main');
 var body = document.querySelector('.body');
 var hideButton = document.querySelector('.main-body-hide');
 toggelButton.addEventListener('click', () => {
     hideButton.classList.toggle('main-body');
     toggelPage.classList.toggle('full-main');
     toggelButton.classList.toggle('fa-times');

     body.classList.toggle('body-full');
 });