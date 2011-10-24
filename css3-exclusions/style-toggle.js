(function() {
    var defaultStyleText = 'default spec. style';
    var additionalStyleText = "additional spec. style";
    var toggle;


    function toggleStyle() {
        var st = document.getElementById('st');

        if (st.getAttribute('disabled') === 'true') {
            st.removeAttribute('disabled');
            toggle.textContent = defaultStyleText;
        } else {
            st.setAttribute('disabled', 'true');
            toggle.textContent = additionalStyleText;
        }
    }

    window.onload = function() {
        var divHead = document.getElementById('div-head');
        toggle = document.createElement('a');

		divHead.insertBefore(toggle, divHead.firstChild);
        toggle.textContent = additionalStyleText;
        toggle.setAttribute('class', 'toggle');
        toggle.setAttribute('href', '#');
        toggle.addEventListener("click", toggleStyle, false);
    };
    
})();

