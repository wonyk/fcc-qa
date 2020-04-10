$(function () {
  // page path will be like /b/:board/:thread_id
  let pagePath = window.location.pathname.replace(/\/$/, '')
  let [board, thread_id] = pagePath.slice(3).split('/')
  let rawRepliesData = []
  document.title = 'AMB - ' + board

  // function to generate replies html
  function getRepliesHtml(replies) {
    if (replies.length === 0) {
      let emptyReply =
        'No replies found. Use the form above to add some replies'
      return emptyReply
    }
    let innerRepliesHtml = replies.map((reply, i) => {
      let deleteButtonAvil =
        reply.text === "['Deleted']"
          ? ''
          : '<button class="btn btn-sm btn-action tooltip float-right reply-delete" data-tooltip="Delete">' +
            '<i class="icon icon-delete"></i>' +
            '</button>'
      let singleReply =
        `<div class="card replies" id=${reply._id}>` +
        '<div class="card-header">' +
        '<button class="btn btn-sm btn-action tooltip float-right reply-flag" data-tooltip="Report">' +
        '<i class="icon icon-flag"></i>' +
        '</button>' +
        deleteButtonAvil +
        `<div class="card-title">#${i + 1} Anonymous, created ${moment(
          reply.created_on
        ).fromNow()} (${moment(reply.created_on)})</div>` +
        '</div>' +
        `<div class="card-body">${reply.text}</div>` +
        '</div>'
      return singleReply
    })
    return innerRepliesHtml.reverse()
  }

  // function to generate thread card Html
  function getThreadHtml(data) {
    let cardHtml =
      `<div class="card-header" id=${data._id}>` +
      '<button class="btn btn-sm btn-action tooltip float-right thread-flag" data-tooltip="Report">' +
      '<i class="icon icon-flag"></i>' +
      '</button>' +
      '<button class="btn btn-sm btn-action tooltip float-right thread-delete" data-tooltip="Delete">' +
      '<i class="icon icon-delete"></i>' +
      '</button>' +
      `<div class="card-title h5">${pagePath}</div>` +
      `<div class="card-subtitle text-gray">Created ${moment(
        data.created_on
      ).fromNow()} | Updated ${moment(data.bumped_on).fromNow()}</div>` +
      '</div>' +
      `<div class="card-body">${data.text}</div>` +
      '<div class="card-footer"></div>'
    return cardHtml
  }

  // Initial function to run every time the page refresh
  function getThreadData() {
    $.get(
      `/api/replies/${board}`,
      {
        thread_id
      },
      function (data) {
        console.log(data)
        rawRepliesData = [...data.replies]
        let threadHtml = getThreadHtml(data)
        $('#thread-card').html(threadHtml)
        let repliesHtml = getRepliesHtml(rawRepliesData)
        $('#reply-card').html(repliesHtml)
      }
    ).fail(function (err) {
      console.log(err)
      let threadHtml =
        '<div class="card-header">' +
        `<div class="card-title h5">An error occurred!</div>` +
        `<div class="card-body">Please try again later</div>`
      $('#thread-card').html(threadHtml)
      let repliesHtml =
        `<div class="card replies">` +
        '<div class="card-header">' +
        `<div class="card-title">An error occurred</div>` +
        '</div>' +
        `<div class="card-body">Please try again</div>` +
        '</div>'
      $('#reply-card').html(repliesHtml)
    })
  }

  getThreadData()

  // Submit new reply
  $('#newReply').submit(function (e) {
    e.preventDefault()
    $.post(
      `/api/replies/${board}`,
      $('#newReply').serialize() + '&thread_id=' + thread_id,
      function (data) {
        console.log('data', data)
        rawRepliesData.push(data)
        let repliesHtml = getRepliesHtml(rawRepliesData)
        $('#reply-card').html(repliesHtml)
        $('#newReply').trigger('reset')
        // // Show success for a few seconds
        $('.toast-form').addClass('toast-success')
        $('.toast-form').removeClass('d-none')
        $('.toast-form').text('Success!')
        window.setTimeout(function () {
          $('.toast-form').addClass('d-none')
          $('.toast-form').removeClass('toast-success')
        }, 3000)
      }
    ).fail(function (err) {
      console.log(err)
      $('.toast-form').addClass('toast-error')
      $('.toast-form').removeClass('d-none')
      $('.toast-form').text('An error occurred.')
      window.setTimeout(function () {
        $('.toast-form').addClass('d-none')
        $('.toast-form').removeClass('toast-error')
      }, 3000)
    })
  })

  // Report thread
  $(document).on('click', 'button.thread-flag', function () {
    let ele = this
    if ($(ele).attr('data-tooltip') === 'Reported') {
      return
    }
    $.ajax({
      url: `/api/threads/${board}`,
      method: 'PUT',
      data: {
        thread_id
      }
    })
      .done(function () {
        $(ele).addClass('btn-success')
        $(ele).attr('data-tooltip', 'Reported')
      })
      .fail(function () {
        $(ele).addClass('btn-error')
      })
  })

  // Report reply
  $(document).on('click', 'button.reply-flag', function () {
    let ele = this
    if ($(ele).attr('data-tooltip') === 'Reported') {
      return
    }
    let reply_id = $(ele).closest('.replies').attr('id')
    $.ajax({
      url: `/api/replies/${board}`,
      method: 'PUT',
      data: {
        thread_id,
        reply_id
      }
    })
      .done(function () {
        $(ele).addClass('btn-success')
        $(ele).attr('data-tooltip', 'Reported')
      })
      .fail(function () {
        $(ele).addClass('btn-error')
      })
  })

  // Delete Reply (Open Modal)
  $(document).on('click', 'button.reply-delete', function () {
    let reply_id = $(this).closest('div.replies').attr('id')
    $('.modal').addClass('active')
    $('.modal').attr('delete-id', reply_id)
    $('.modal').attr('type', 'replies')
    $('#password-toast').addClass('d-none')
  })

  // Delete Thread (Open Modal)
  $(document).on('click', 'button.thread-delete', function () {
    let reply_id = $(this).closest('div.replies').attr('id')
    $('.modal').addClass('active')
    $('.modal').attr('delete-id', reply_id)
    $('.modal').attr('type', 'threads')
    $('#password-toast').addClass('d-none')
  })

  // Function to handle replies after successful deletion
  function replyDeleteSuccess(reply_id) {
    let ele = $(`#${reply_id}`)
    ele.children('.card-header').children('.reply-delete').remove()
    ele.children('div.card-body').text("['Deleted']")
    $('.modal').removeClass('active')
  }

  // Function to handle page after thread deleted
  function threadDeleteSuccess() {
    $('.modal').removeClass('active')
    $('.toast-form').addClass('toast-success')
    $('.toast-form').removeClass('d-none')
    $('.toast-form').text('Success! Redirecting...')
    window.setTimeout(function () {
      window.location.replace(`/b/${board}`)
    }, 2000)
  }

  // Delete Reply / Thread (Submit form with password)
  $('#delete').submit(function (e) {
    e.preventDefault()
    let reply_id = $('.modal').attr('delete-id')
    let type = $('.modal').attr('type')
    $('#password-toast').addClass('d-none')
    if (type === 'replies') {
      $.ajax({
        url: `/api/replies/${board}`,
        method: 'DELETE',
        data:
          $(this).serialize() + `&thread_id=${thread_id}&reply_id=${reply_id}`
      })
        .done(function () {
          // Ensure the replies are updated and modal closed
          replyDeleteSuccess(reply_id)
          $('#delete').trigger('reset')
        })
        .fail(function () {
          $('#password-toast').removeClass('d-none')
          $('#delete').trigger('reset')
        })
    } else {
      $.ajax({
        url: `/api/threads/${board}`,
        method: 'DELETE',
        data: $(this).serialize() + `&thread_id=${thread_id}`
      })
        .done(function () {
          // Ensure the thread deleted and page redirected
          threadDeleteSuccess()
          $('#delete').trigger('reset')
        })
        .fail(function () {
          $('#password-toast').removeClass('d-none')
          $('#delete').trigger('reset')
        })
    }
  })

  // Close modal (press 'X')
  $('#close-modal').click(function () {
    $('.modal').removeClass('active')
    $('#delete').trigger('reset')
    return false
  })
})
