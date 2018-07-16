// Hide default submit

$(function () {
    hidden_button();

});
function hidden_button() {

    $("#settings").find("input[name=commit]").css("display", "none");
    //console.log($('#top-menu');//.filter('active').attr('href').substring(1));
}