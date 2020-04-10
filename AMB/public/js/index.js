$(function () {
  $('#board-select').submit(e => {
    e.preventDefault()
    let board = $('#board').val()
    window.location.href = '/b/' + board
  })
})
