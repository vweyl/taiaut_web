require(["Olives/OObject"],

function (OObject) {
	function AppConstructor() {
	
		var nav = document.querySelector('.subnav');
		var distance = nav.offsetTop - nav.offsetHeight;
		window.addEventListener('scroll', function(event){
			var scrollTop = window.scrollY;
			if(scrollTop >= distance) {
				nav.classList.add('subnav-fixed');
			} else {
				nav.classList.remove('subnav-fixed');
			}
		});
	}
	

	AppConstructor.prototype = new OObject();
	(new AppConstructor).alive(document.querySelector("body"));
});