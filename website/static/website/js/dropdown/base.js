(function($) {
    $(function() {
        var selectField = $('id_position_set-0-title'),
            verified = $('.data');

        function toggleVerified(value) {
            if (value === 'High School Student') {
                verified.hide();
            } else {
                verified.show();
            }
        }

        // show/hide on load based on pervious value of selectField
        toggleVerified(selectField.val());
        console.log(selectField.val());

        // show/hide on change
        selectField.change(function() {
            toggleVerified($(this).val());
            console.log(selectField.val());
        });

    });
})(django.jQuery);