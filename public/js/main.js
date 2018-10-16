$(document).ready(() => {
  $(".delete-article").on("click", (e) => {
    const id = $(e.target).data("id");
    $.ajax({ 
      type: "DELETE", 
      url: "/article/delete/" + id, 
      success: (res) => { window.location.href="/"; },
      error: (err) => { console.log(err); }
    });
  });
});