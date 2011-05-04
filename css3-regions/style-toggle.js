(function() {

    var defaultStyleText = 'default spec. style';
    var additionalStyleText = "additional spec. style";
    var toggle;


    function toggleStyle() {
        var st = document.getElementById('st');

        if (st.disabled === true) {
            st.disabled = false;
            toggle.textContent = defaultStyleText;
        } else {
            st.disabled = true;
            toggle.textContent = additionalStyleText;
        }
    }

    window.onload = function() {
        var divHead = document.getElementById('div-head');
        toggle = document.createElement('a');

		divHead.insertBefore(toggle, divHead.firstChild);
        toggle.textContent = defaultStyleText;
        toggle.setAttribute('class', 'toggle');
        toggle.setAttribute('href', '#');
        toggle.addEventListener("DOMActivate", toggleStyle, false);
    };
})();

