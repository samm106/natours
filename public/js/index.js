/* eslint-disable*/

import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

const mapBox = document.getElementById('map');
const logInForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const bookbtn = document.getElementById('book-tour');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (logInForm) {
  logInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
  });
}

if (bookbtn) {
  bookbtn.addEventListener('click', (e) => {
    e.target.textContent = 'processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId)
  });
}
