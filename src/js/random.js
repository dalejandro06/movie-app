(async function cargarUsuario() {
	async function getData(url) {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	}
	function userTemplate(first, second, img) {
		return `<div class="user">
      <img src="${img}" alt=""/>
      <span>${first} ${second}</span>
    </div>`;
	}
	const users = await getData('https://randomuser.me/api/');
	const firstName = users.results[0].name.first;
	const lastName = users.results[0].name.last;
	const userImage = users.results[0].picture.large;
	const $user = document.getElementById('user');
	const TextoHtml = userTemplate(firstName, lastName, userImage);
	const HTMLCreate = document.implementation.createHTMLDocument();
	HTMLCreate.body.innerHTML = TextoHtml;
	$user.append(HTMLCreate.body.children[0]);
	$user.classList.add('fadeIn');

	// playlist de amigos
	function friendsTemplate(name, last, img) {
		return `<li class="playlistFriends-item">
      <a href="#">
        <img src="${img}" alt="echame la culpa" />
        <span>
          ${name} ${last}
        </span>
      </a>
    </li>`;
	}
	const $playlistContainer = document.getElementById('playlist-friends');

	(async function MuchasPersonas() {
		for (i = 0; i < 11; i++) {
			const users2 = await getData('https://randomuser.me/api/');
			const first = users2.results[0].name.first;
			const last = users2.results[0].name.last;
			const img = users2.results[0].picture.large;
			const guardarTextoHtml = friendsTemplate(first, last, img);
			const crearHtml = document.implementation.createHTMLDocument();
			crearHtml.body.innerHTML = guardarTextoHtml;
			$playlistContainer.append(crearHtml.body.children[0]);
			$playlistContainer.classList.add('fadeIn');
		}
	})();
})();
