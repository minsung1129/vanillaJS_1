const API_ENDPOINT = 'https://api.thecatapi.com/v1';
// /images/search?limit=20
const Posts = document.getElementById('catPosts');
const allPosts = document.getElementById('Posts');
const Modal = document.getElementById('catModal');
const catModal = document.getElementById('modal');
const search = document.getElementById('search');
const body = document.getElementById('body');

const items = JSON.parse(localStorage.getItem("items")) || [];

const request = async url => {
    try {
        const response = await fetch(url);
        if(response.ok) {
            const data = await response.json();
            return data;
        } else {
            const errorData = await response.json();
            throw errorData;
        }
    } catch(e) {
        throw {
            message: e.message,
            status: e.status
        };
    }
};

async function getData() {
    const value = search.value;
    try{
        const breeds = await request(`${API_ENDPOINT}/breeds/search?q=${value}`);
        const resData = breeds.map(async breed => {
            return await request(`${API_ENDPOINT}/images/search?limit=20&breed_ids=${breed.id}`);
        });
        const responses = await Promise.all(resData);
        const result = Array.prototype.concat.apply([], responses);
        return {
            isError: false,
            data: result
        };
    }catch(e){
        return {
            isError: true,
            data: e
        };
    }
}

debounce = (func, wait = 20, immediate = true) => {
    let timeout;
    return function () {
      const context = this, args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

const renderPost = (data) => {
    if(data.isError){
        Posts.innerHTML = data.data;
        return;
    }
    Posts.innerHTML = "";
    data.data.map((e,i)=>(
        Posts.innerHTML += `
            <img src="${e.url}" width="240px" height="240px" class="cat" data-index=${i} data-url=${e.url} />
        `
    )).join('');
}

Posts.classList.toggle

const handdleInput = async () => {
    Posts.innerHTML = "Loading~"
    const data = await getData();
    console.log(data);
    renderPost(data);
}

const handdleClick = (e) => {
    if (!e.target.matches("img")) return;

    allPosts.classList.toggle('hidden');
    Modal.classList.toggle('hidden');
    
    if(Modal.classList.value !== "hidden")
    catModal.innerHTML = `
        <img src="${e.target.dataset.url}" width="500px" height="500px" />
    `
}

search.addEventListener("keyup", debounce(handdleInput));
body.addEventListener('click', handdleClick);
