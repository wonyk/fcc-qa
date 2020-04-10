$(function () {
  // page path will be like /b/:board
  let pagePath = window.location.pathname.replace(/\/$/, '')
  // Below is normal
  let board = pagePath.slice(3)
  let rawThreadsData = []
  $('h1').text(pagePath)
  document.title = 'AMB - ' + board
  // function to generate replies html
  function getRepliesHtml(replies) {
    // Loop the 3 replies if any to make the repliesHtml
    let innerRepliesHtml = replies.map(reply => {
      let singleReply =
        `<div class="card card-replies replies" id=${reply._id}>` +
        '<div class="card-header">' +
        '<button class="btn btn-sm btn-action float-right tooltip reply-flag" data-tooltip="Report">' +
        '<i class="icon icon-flag"></i>' +
        '</button>' +
        `<div class="card-title">Anonymous, ${moment(
          reply.created_on
        ).fromNow()} (${moment(reply.created_on)})</div>` +
        '</div>' +
        `<div class="card-body">${reply.text}</div>` +
        '</div>'
      return singleReply
    })
    return innerRepliesHtml
  }

  // function to generate threads Html
  function getThreadsHtml(threads) {
    if (threads.length === 0) {
      let emptyThread =
        `<div class="card">` +
        '<div class="card-header">' +
        `<div class="card-title h5">No threads found</div>` +
        `<div class="card-body">Use the form above to add some now!</div>`
      return emptyThread
    }
    let threadHtml = threads.map((thread, i) => {
      let repliesHtml = getRepliesHtml(thread.replies)
      let cardHtml =
        `<div class="card card-threads c-hand" id=${thread._id}>` +
        '<div class="card-header">' +
        '<button class="btn btn-sm btn-action tooltip float-right thread-flag" data-tooltip="Report">' +
        '<i class="icon icon-flag"></i>' +
        '</button>' +
        `<div class="card-title h5">#${i + 1} Trending</div>` +
        `<div class="card-subtitle text-gray">Created ${moment(
          thread.created_on
        ).fromNow()} | Updated ${moment(thread.bumped_on).fromNow()}</div>` +
        '</div>' +
        `<div class="card-body">${thread.text}</div>` +
        '<div class="card-footer">' +
        repliesHtml.join('')
      '</div>' + '</div>'
      return cardHtml
    })
    return threadHtml
  }

  function getBoardData() {
    $.get(`/api/threads/${board}`, function (data) {
      rawThreadsData = [...data.threads]
      let threadArray = getThreadsHtml(data.threads)
      $('#loading').addClass('p-none')
      $('#threads').html(threadArray)
    }).fail(function (err) {
      console.log(err)
      let threadArray =
        `<div class="card fail">` +
        '<div class="card-header">' +
        `<div class="card-title h5">An error occurred!</div>` +
        `<div class="card-body">Please try again later</div>`
      $('#loading').addClass('p-none')
      $('#threads').html(threadArray)
    })
  }

  getBoardData()

  $('#newThread').submit(function (e) {
    e.preventDefault()
    $.post(`/api/threads/${board}`, $('#newThread').serialize(), function (
      data
    ) {
      console.log('data', data)
      rawThreadsData.unshift({
        replies: [],
        ...data
      })
      if (rawThreadsData.length > 1) {
        rawThreadsData.pop()
      }
      console.log('rawdata', rawThreadsData)
      let threadArray = getThreadsHtml(rawThreadsData)
      $('#threads').html(threadArray)
      $('#newThread').trigger('reset')
      // Show success for a few seconds
      $('.toast').addClass('toast-success')
      $('.toast').removeClass('d-none')
      $('.toast').text('Success!')
      window.setTimeout(function () {
        $('.toast').addClass('d-none')
        $('.toast').removeClass('toast-success')
      }, 3000)
    }).fail(function (err) {
      console.log(err)
      $('.toast').addClass('toast-error')
      $('.toast').removeClass('d-none')
      $('.toast').text('An error occurred.')
      window.setTimeout(function () {
        $('.toast').addClass('d-none')
        $('.toast').removeClass('toast-error')
      }, 3000)
    })
  })

  $(document).on('click', 'button.thread-flag', function (e) {
    e.stopPropagation()
    let ele = this
    if ($(ele).attr('data-tooltip') === 'Reported') {
      return
    }
    let _id = $(ele).closest('div.card-threads').attr('id')
    $.ajax({
      url: `/api/threads/${board}`,
      method: 'PUT',
      data: {
        thread_id: _id
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

  $(document).on('click', 'button.reply-flag', function (e) {
    e.stopPropagation()
    let ele = this
    if ($(ele).attr('data-tooltip') === 'Reported') {
      return
    }
    let reply_id = $(ele).closest('div.card-replies').attr('id')
    let thread_id = $(ele).closest('div.card-threads').attr('id')
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

  $(document).on('click', 'div.card-threads', function () {
    let thread_id = $(this).closest('div.card-threads').attr('id')
    window.location.href = `${board}/${thread_id}`
  })
})
