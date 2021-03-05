const API_ENDPOINT = 'https://api.thecatapi.com/v1';
const Posts = document.getElementById('catPosts');
const allPosts = document.getElementById('Posts');
const Modal = document.getElementById('catModal');
const catModal = document.getElementById('modal');
const search = document.getElementById('search');
const body = document.getElementById('body');
const footer = document.getElementById('footer');
const dark = document.getElementById('dark');

const items = JSON.parse(localStorage.getItem("items")) || [];


search.focus();
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
        const result = Array.prototype.concat.apply([], responses); // 배열로 만들기.
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
    console.log(data);
    data.map((e,i)=>(
        Posts.innerHTML += `
            <img src="${e.url}" width="240px" height="240px" class="cat" data-index=${i} data-url=${e.url} data-name=${e.breeds[0].name} data-origin=${e.breeds[0].origin} />
        `
    )).join('');
}

let index = 0;
let maxSize = 0;

const handdleInput = async () => {
    if(search.value === "") return;
    Posts.innerHTML = "Loading~"
    const data = await getData();
    if(data.isError) return;
    if(data.data.length === 0){
        Posts.innerHTML = ""
        Posts.innerHTML = "<h2>결과 없음</h2>"
        console.log('??')
        return;
    }
    maxSize = data.data.length;

    index = 0;
    console.log(1,index, data);
    Posts.innerHTML = "";
    lazyLoading(data);
}

const handdleClick = (e) => {
    if (!e.target.matches("img")) return;

    allPosts.classList.toggle('fade');
    Modal.classList.toggle('hidden');

    console.log(e.target.dataset)

    if(Modal.classList.value !== "hidden"){
        catModal.innerHTML = `
        <img src="${e.target.dataset.url}" width="500px" height="500px" />
        <div>
            <span> 이름 : ${e.target.dataset.name} <span>
            <span> 고향 : ${e.target.dataset.origin} <span>
        </div>
    `
    }
}

const lazyLoading = (data) => {
    if(index > maxSize) return; 
    console.log(2, data);
    if ("IntersectionObserver" in window){
        const intersectionObserver = new IntersectionObserver((entry, observer) => {
            const sliceData = data.data.slice(index, index+20);
            index += 20;
            if(sliceData.length === 0) return;
            renderPost(sliceData);
        });
        
        intersectionObserver.observe(footer);
    }

}

const handdleDark = () => {
    body.classList.toggle('dark');
    if(body.classList.value.includes('dark')){
        localStorage.setItem('dark', true);
    }else{
        localStorage.setItem('dark',false);
    }
}

search.addEventListener("keyup", debounce(handdleInput));
body.addEventListener('click', handdleClick);
dark.addEventListener('click', handdleDark);
