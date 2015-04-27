(function() {
    var defaultStyleText = 'default spec. style';
    var additionalStyleText = "additional spec. style";
    var toggle;
    
    function toggleStyle() {
        var st = document.getElementById('st');

        if (st.hasAttribute('disabled') === true) {
            st.removeAttribute('disabled');
            st.disabled = false;
            toggle.textContent = defaultStyleText;
        } else {
            st.setAttribute('disabled', 'true');
            st.disabled = true;
            toggle.textContent = additionalStyleText;
        }
    }

    window.onload = function() {
        var st = document.getElementById('st');
        var divHead = document.getElementById('div-head');
        var defaultText = defaultStyleText;
        
        toggle = document.createElement('a');

		divHead.insertBefore(toggle, divHead.firstChild);
        toggle.textContent = defaultText;
        toggle.setAttribute('class', 'toggle');
        toggle.setAttribute('href', '#');
        toggle.addEventListener("click", toggleStyle, false);
    };
    
})();


