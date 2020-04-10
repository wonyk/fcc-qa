$(document).ready(function() {
  let itemsRaw = []

  function getBooks(data) {
    let items = []
    if (data.length === 0) {
      return $('#booklist').html(
        `<li class="pure-menu-heading">No Books Found</li>`
      )
    }
    $.each(data, function(i, val) {
      items.push(
        `<li class="pure-menu-item" id="${val._id}">` +
          `<a href="#" class="pure-menu-link">${val.title} (${val.commentcount})</a>` +
          '</li>'
      )
      return i !== 14
    })
    if (items.length > 14) {
      items.push(
        `<li class="pure-menu-heading">and ${data.length - 15} more!</li>`
      )
    }
    $('#booklist').html(items.join(''))
  }

  // Init the book-list
  $.getJSON('/api/books', function(data) {
    itemsRaw = data
    getBooks(data)
  })

  // Switch to comments page and show comments
  $('#booklist').on('click', 'li.pure-menu-item', function() {
    $('#comment-form').trigger('reset')
    $('#newbook').addClass('hidden')
    $('#commentpage').removeClass('hidden')
    let id = this.id
    $('#comments').attr('book-id', id)
    let index = itemsRaw.findIndex(d => d._id === id)
    let bookData = itemsRaw[index]
    $('#comments h1').text(
      `${bookData.commentcount} ${
        bookData.commentcount > 1 ? 'Comments' : 'Comment'
      } to "${bookData.title}"`
    )
    if (bookData.commentcount === 0) {
      return $('#allcomments').html(
        `<div class="box">No comment. Add one now.</div>`
      )
    } else {
      $.getJSON('/api/books/' + id, function(data) {
        let comments = []
        $.each(data.comments, function(i, val) {
          comments.push(`<div class="box">>${val}</div><hr />`)
        })
        $('#allcomments').html(comments.join(''))
      })
    }
  })

  // Switch to New Book Page
  $('#newbookbtn').on('click', function() {
    $('#newbook-form').trigger('reset')
    $('#detailComments').html('')
    $('#commentpage').addClass('hidden')
    $('#newbook').removeClass('hidden')
  })

  // Submit new book action
  $('#newbook-form').submit(function(e) {
    e.preventDefault()
    if ($('#title').val().length === 0) {
      return $('#detailComments').html(
        `<h3 style="color: red;">Please provide a book title</h3>`
      )
    }
    $('#detailComments').html('')
    $.ajax({
      url: '/api/books',
      type: 'POST',
      dataType: 'json',
      data: $('#newbook-form').serialize(),
      success: function(data) {
        $('#newbook-form').trigger('reset')
        let modData = {
          _id: data._id,
          title: data.title,
          commentcount: 0
        }
        itemsRaw.unshift(modData)
        getBooks(itemsRaw)
        $('#detailComments').html(
          '<h3 style="color: blue;">New Book Added!</h3>'
        )
      },
      error: function(xhr) {
        $('#detailComments').html(
          '<h3 style="color: red;">' + xhr.responseText + '</h3>'
        )
      }
    })
  })
  // Delete a single book and redirect to add book page
  $(document).on('click', '#comments button.button-delete', function() {
    let id = $('#comments').attr('book-id')
    $.ajax({
      url: '/api/books/' + id,
      type: 'delete',
      success: function(data) {
        //update list
        $('#detailComments').html(
          '<h3 style="color: blue;">Book deleted successfully<h3>'
        )
        let index = itemsRaw.findIndex(p => p._id === id)
        itemsRaw.splice(index, 1)
        getBooks(itemsRaw)
        $('#newbook-form').trigger('reset')
        $('#commentpage').addClass('hidden')
        $('#newbook').removeClass('hidden')
      },
      error: function(xhr) {
        let str = xhr.responseText.replace(/"/g, '')
        $('#statusText').html(`<h3 style="color: red;">${str}</h3>`)
      }
    })
  })
  // Delete All Books
  $('#deleteAllBooks').click(function() {
    if (itemsRaw.length === 0) {
      $('#detailComments').html(
        `<h3 style="color: blue;">All books deleted</h3>`
      )
      return true
    }
    $.ajax({
      url: '/api/books',
      type: 'delete',
      dataType: 'json',
      success: function(data) {
        itemsRaw = []
        getBooks(itemsRaw)
        $('#newbook-form').trigger('reset')
        $('#commentpage').addClass('hidden')
        $('#newbook').removeClass('hidden')
        $('#detailComments').html(
          `<h3 style="color: blue;">All books deleted</h3>`
        )
      },
      error: function(xhr) {
        $('#detailComments').html(
          `<h3 style="color: red;">${xhr.responseText}</h3>`
        )
      }
    })
  })

  // Add comments to a book
  $('#comment-form').submit(function(e) {
    e.preventDefault()
    $('#statusText').html('')
    const id = $('#comments').attr('book-id')
    $.ajax({
      url: `https://freecodecamp-boilerplate-project-library-5.glitch.me/api/books/${id}`,
      type: 'POST',
      dataType: 'json',
      data: $('#comment-form').serialize(),
      success: function(data) {
        $('#comment-form').trigger('reset')
        let comments = []
        $.each(data.comments, function(i, val) {
          comments.push(`<div class="box">>${val}</div><hr />`)
        })
        $('#allcomments').html(comments.join(''))
        let index = itemsRaw.findIndex(p => p._id === id)
        let commentcount = data.comments.length
        itemsRaw[index].commentcount = commentcount
        getBooks(itemsRaw)
        $('#comments h1').text(
          `${commentcount} ${commentcount > 1 ? 'Comments' : 'Comment'} to "${
            data.title
          }"`
        )
      },
      error: function(xhr) {
        $('#statusText').html(
          `<h3 style="color: red;">${xhr.responseText}</h3>`
        )
      }
    })
  })
})
