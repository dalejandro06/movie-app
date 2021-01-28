(async function load() {
	async function getData(url) {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	}
	const $home = document.getElementById('home');
	const $form = document.getElementById('form');
	const $featuringContainer = document.getElementById('featuring');
	const BASE_API = 'https://yts.mx/api/v2/';

	//asignamos el evento de buscar la película, antes de la busqueda de las pelis para que no espere y funcione
	//todo lo que tenga que ver con el cuadro de busqueda va aca
	//funcion para poner multiples atributos a $elementos html creados en js
	//recibe como parametro el elemento que cree que quiera ponerle atributos css
	//le paso por parametro los atributos que le quiera poner al elemento
	function setAttribute($element, attributes) {
		//hacer un ciclo dependiendo del # de elementos que tenga en mi objeto
		for (const attribute in attributes) {
			//un atributo en atributos
			//genera un nuevo atributo para mi elemento, como $loader[newAttribute]
			// $loader[newAttribute] crea un atributo al obj como width... height etc
			$element.setAttribute(attribute, attributes[attribute]);
		}
	}
	function featuringTemplate(movie) {
		return `<div class="featuring">
    <div class="featuring-image">
      <img src="${movie.medium_cover_image}" alt="">
    </div>
    <div class="featuring-content">
      <p class="featuring-title">Película encontrada</p>
      <p class="featuring-album">${movie.title}</p>
    </div>
  </div>`;
	}

	$form.addEventListener('submit', async (event) => {
		event.preventDefault();
		$home.classList.add('search-active');
		const $loader = document.createElement('img');
		// el primero es el elemento, el otro son atributos pasados por un objeto{}
		setAttribute($loader, {
			src: 'src/images/loader.gif',
			height: 50,
			width: 50
		});
		//mandamos $loader al featuringContainer que recibe el id featuring de html
		$featuringContainer.append($loader);
		//traer el valor que puso el usuario en el input de buscar
		//le pasamos como atributo un elemento html, en este caso la const $form
		const data = new FormData($form);
		//data.get me trae los valores que se pusieron en el input a traves del atributo name del input del html, en este caso name='name' ne el input
		//creamos una const para que espere a que llegue los datos del input
		//query term es un parametro que esta en la api de las películas, sirve para traer el nombre de las películas,
		//manejo de errores para cuando no se encuentra una película
		try {
			const {
				data: { movies }
			} = await getData(
				`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`
			);
			const htmlString = featuringTemplate(movies[0]);
			$featuringContainer.innerHTML = htmlString;
		} catch (error) {
			$loader.remove();
			$home.classList.remove('search-active');
		}
	});

	function videoItemTemplate(movie, category) {
		return `<div class="primaryPlayListItem" data-id="${movie.id}" data-category="${category}">
      <div class="primaryPlayListItem-image">
        <img src="${movie.medium_cover_image}" alt="">
      </div>
      <h4 class="primaryPlayListItem-title">
        ${movie.title} 
      </h4>
    </div>`;
	}

	function createTemplate(htmlString) {
		const html = document.implementation.createHTMLDocument();
		html.body.innerHTML = htmlString;
		//para guardar la funcion en una constante toca retornar este valor
		return html.body.children[0];
	}

	function addEventClick($element) {
		$element.addEventListener('click', () => {
			showModal($element);
		});
	}

	function renderMovieList(list, $container, category) {
		//quitar el gift de carga
		$container.children[0].remove();
		list.forEach((movie) => {
			const HTMLString = videoItemTemplate(movie, category);
			const movieElement = createTemplate(HTMLString);
			$container.append(movieElement);
			const image = movieElement.querySelector('img');
			image.addEventListener('load', () => {
				image.classList.add('fadeIn');
			});
			addEventClick(movieElement);
		});
	}
	async function cacheExist(genre) {
		//recibe un genero(accion,drama...), y completa el nombre con list
		let listName = `${genre}List`;
		//validar si las listas existen o no dentro de localstorage
		const cacheList = window.localStorage.getItem(listName);
		if (cacheList) {
			return JSON.parse(cacheList);
		}
		//entramos a data, a movies y le cambiamos el nombre de movies a data
		const {
			data: { movies: data }
		} = await getData(`${BASE_API}list_movies.json?genre=${genre}`);
		//cuando no encuentre datos en la cache, con esta funcion los pongo
		//le pasamos el nombre de una lista, y los datos de esa lista declarados arriba
		//guardo los datos qe necesite que se guarden en el navegador para que no se recarguen de nuevo
		//setitem es para crear un nuevo elemento que se va a guardar
		window.localStorage.setItem(listName, JSON.stringify(data));
		//json.stringify hace que lo que le ponga en parametro lo convierte en texto, ya que por defecto es un objeto, esto para guardarlos para luego volverlos objetos de nuevo, si no no funciona
		return data;
	}

	//le pasamos el parametro de genero de la funcion cachelist que se reemplaza en la url
	const actionList = await cacheExist('action');
	const $actionContainer = document.querySelector('#action');
	renderMovieList(actionList, $actionContainer, 'action');

	const dramaList = await cacheExist('drama');
	const $dramaContainer = document.querySelector('#drama');
	renderMovieList(dramaList, $dramaContainer, 'drama');

	const animationList = await cacheExist('animation');
	const $animationContainer = document.getElementById('animation');
	renderMovieList(animationList, $animationContainer, 'animation');

	const $modal = document.getElementById('modal');
	const $overlay = document.getElementById('overlay');
	const $hideModal = document.getElementById('hide-modal');

	const $modalImage = $modal.querySelector('img');
	const $modalTitle = $modal.querySelector('h1');
	const $modalDescription = $modal.querySelector('p');

	//le paso por parametro las listas que tengo, y el id de las pelis
	//sirve para poner los datos de la película en el modal
	function findById(list, id) {
		//me busca dentro de actionlist, y retorna el id del movie que le pase
		return list.find((movie) => movie.id === parseInt(id, 10));
	}
	//filtrar películas  por categoria
	function findMovie(id, category) {
		switch (category) {
			case 'action': {
				return findById(actionList, id);
			}
			case 'drama': {
				return findById(dramaList, id);
			}
			default: {
				return findById(animationList, id);
			}
		}
		//find devuelve el primer elemento del array con el id que ponemos
	}
	function showModal($element) {
		$overlay.classList.add('active');
		$modal.style.animation = 'modalIn .8s forwards';
		//dataset me llama los datas que pegamos en el html de la funcion videoitemtemplate, que son id y category
		const id = $element.dataset.id;
		const category = $element.dataset.category;
		const data = findMovie(id, category);
		//textcontent sirve para cambiar el contenido del html
		$modalTitle.textContent = data.title;
		//le cambio el atributo al src de img, a data.medium...
		$modalImage.setAttribute('src', data.medium_cover_image);
		//textcontent porque por defecto hay un lorem en el html
		$modalDescription.textContent = data.description_full;
	}
	$hideModal.addEventListener('click', hideModal);
	function hideModal() {
		$overlay.classList.remove('active');
		$modal.style.animation = 'modalOut .8s forwards';
	}
})();
