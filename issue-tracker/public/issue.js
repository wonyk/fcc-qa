$(function() {
  // Remove the backslash since pathname contains the immediate slash after the domain
  let currentProject = window.location.pathname.replace(/\//g, '')

  // Global variable
  let allIssueData = []
  let queryObj = {}
  let url = 'api/issues/' + currentProject
  $('#projectTitle').text(`Viewing all issues for: ${currentProject}`)
  document.title = 'Issue Tracker - ' + currentProject
  const getData = params => {
    $.ajax({
      type: 'GET',
      url,
      data: params,
      success: function(data) {
        let issues = []
        // Shallow copy of the data
        allIssueData = [...data]
        if (data.length === 0) {
          issues = [
            '<div class="box">' +
              '<article class="media">' +
              '<div class="media-content">' +
              '<div class="content">' +
              '<p>' +
              '<strong>No issues</strong>' +
              '<br />' +
              'To get started, you should create an issue.' +
              '</p>' +
              '</div>' +
              '</div>' +
              '</article>' +
              '</div>'
          ]
          $('#issues').html(issues.join(''))
        } else {
          createIssueHtml(data)
        }
      }
    })
  }
  getData()

  const createIssueHtml = data => {
    let issues = []
    data.forEach(ele => {
      let openStatusText = ele.open
        ? '<span class="tag is-danger">open</span>'
        : '<span class="tag is-success">closed</span>'

      let openCloseToggle = ele.open
        ? `<a class="level-item" aria-label="close" title="close issue"><span class="icon is-small closeIssue"><i class="fas fa-check-circle"></i></span></a>`
        : `<a class="level-item" aria-label="open" title="re-open issue"><span class="icon is-small openIssue"><i class="fas fa-retweet"></i></span></a>`
      let singleBox = [
        '<div class="box">' +
          '<article class="media">' +
          '<div class="media-content">' +
          '<div class="content">' +
          '<p>' +
          `<strong>${ele.issue_title}</strong> <small>@${ele.created_by}</small>` +
          `<small> ${moment(ele.updated_on).fromNow()} </small>` +
          openStatusText +
          '<br />' +
          ele.issue_text +
          '</p>' +
          '</div>' +
          '<nav class="level is-mobile">' +
          `<div class="level-left" id=${ele._id}>` +
          openCloseToggle +
          '<a class="level-item" aria-label="edit" title="edit">' +
          '<span class="icon is-small editIssue">' +
          '<i class="fas fa-edit"></i>' +
          '</span>' +
          '</a>' +
          '<a class="level-item" aria-label="delete" title="delete">' +
          '<span class="icon is-small deleteIssue">' +
          '<i class="fas fa-trash-alt"></i>' +
          '</span>' +
          '</a>' +
          '</div>' +
          '</nav>' +
          '</div>' +
          '</article>' +
          '</div>'
      ]
      issues.push(singleBox)
    })
    $('#issues').html(issues.join(''))
  }

  // Filter the queries based on user input
  $('#searchQueries').click(e => {
    queryObj = {}
    let str = $('#searchbar input').val()
    if (/is:open/i.test(str)) {
      if (!/is:closed/i.test(str)) {
        queryObj.open = true
      }
    } else if (/is:closed/i.test(str)) {
      queryObj.open = false
    }
    // Regex to match the first group until the next semi-colon
    let createdRegex = /created:([a-zA-Z0-9 ]+)( .+:|$)/i
    let assignedRegex = /assigned:([a-zA-Z0-9 ]+)( .+:|$)/i
    let titleRegex = /title:([a-zA-Z0-9 ]+)( .+:|$)/i
    let textRegex = /text:([a-zA-Z0-9 ]+)( .+:|$)/i
    if (createdRegex.test(str)) {
      let kw = createdRegex.exec(str)
      queryObj.created_by = kw[1]
    }
    if (assignedRegex.test(str)) {
      let kw = assignedRegex.exec(str)
      queryObj.assigned_to = kw[1]
    }
    if (titleRegex.test(str)) {
      let kw = titleRegex.exec(str)
      queryObj.issue_title = kw[1]
    }
    if (textRegex.test(str)) {
      let kw = textRegex.exec(str)
      queryObj.issue_text = kw[1]
    }
    getData(queryObj)
  })

  // Open the new issue Modal
  $('#issuebtn').click(e => {
    e.preventDefault()
    $('#newModal').addClass('is-active')
  })

  // Close the new issue Modal
  $('#cancel').click(e => {
    e.preventDefault()
    $('#newModal').removeClass('is-active')
    $('#errorMessageNewForm').hide()
    $('#newIssueForm').trigger('reset')
  })

  // Submit the form in New Modal
  $('#newIssueSubmitBtn').click(e => {
    e.preventDefault()
    $('#errorMessageNewForm').hide()
    $.ajax({
      type: 'POST',
      url: url,
      data: $('form#newIssueForm').serialize(),
      success: function(data) {
        allIssueData.unshift(data)
        createIssueHtml(allIssueData)
        $('#newModal').removeClass('is-active')
        $('#newIssueForm').trigger('reset')
      },
      error: function(xhr) {
        $('#errorMessageNewForm').show()
        $('#errorMessageNewForm').text(xhr.responseJSON.error)
      }
    })
  })

  // A large function to parse all the functions of the 3 icons on the navbar
  $(document).on('click', 'span.icon', function(e) {
    let id = $(this)
      .closest('div')
      .attr('id')
    if ($(this).hasClass('closeIssue')) {
      closeIssue(id)
    } else if ($(this).hasClass('openIssue')) {
      openIssue(id)
    } else if ($(this).hasClass('editIssue')) {
      editIssue(id)
    } else {
      deleteIssue(id)
    }
  })

  const closeIssue = id => {
    $.ajax({
      type: 'PUT',
      url: url,
      data: { _id: id, open: false },
      success: function(data) {
        let index = allIssueData.findIndex(d => d._id === id)
        allIssueData[index].open = false
        createIssueHtml(allIssueData)
      },
      error: function(xhr) {
        $('#errorMessageMain').text(xhr.responseJSON.error)
      }
    })
  }

  const openIssue = id => {
    $.ajax({
      type: 'PUT',
      url: url,
      data: { _id: id, open: true },
      success: function(data) {
        let index = allIssueData.findIndex(d => d._id === id)
        allIssueData[index].open = true
        createIssueHtml(allIssueData)
      },
      error: function(xhr) {
        $('#errorMessageMain').text(xhr.responseJSON.error)
      }
    })
  }

  const deleteIssue = id => {
    $.ajax({
      type: 'DELETE',
      url: url,
      data: { _id: id },
      success: function(data) {
        let index = allIssueData.findIndex(d => d._id === id)
        allIssueData.splice(index, 1)
        createIssueHtml(allIssueData)
      },
      error: function(xhr) {
        $('#errorMessageMain').text(xhr.responseJSON.error)
      }
    })
  }

  const editIssue = id => {
    let index = allIssueData.findIndex(d => d._id === id)
    let filteredData = { ...allIssueData[index] }
    $('#editIssueForm')
      .find('input[name="issue_title"]')
      .val(filteredData.issue_title)
    $('#editIssueForm')
      .find('textarea[name="issue_text"]')
      .val(filteredData.issue_text)
    $('#editIssueForm')
      .find('input[name="created_by"]')
      .val(filteredData.created_by)
    $('#editIssueForm')
      .find('input[name="assigned_to"]')
      .val(filteredData.assigned_to)
    $('#editIssueForm')
      .find('input[name="status_text"]')
      .val(filteredData.status_text)
    $('#editIssueForm').data('localData', filteredData._id)
    $('#editModal').addClass('is-active')
  }

  // Close the edit issue Modal
  $('#editCancel').click(e => {
    e.preventDefault()
    $('#editModal').removeClass('is-active')
    $('#errorMessageEditForm').hide()
    $('#editIssueForm').trigger('reset')
  })

  // Submit Edit Form
  $('#editFormSave').click(e => {
    e.preventDefault()
    let id = $('#editIssueForm').data('localData')
    $('#errorMessageEditForm').hide()
    $.ajax({
      type: 'PUT',
      url: url,
      data: $('form#editIssueForm').serialize() + '&_id=' + id,
      success: function(data) {
        getData(queryObj)
        $('#editModal').removeClass('is-active')
        $('#editIssueForm').trigger('reset')
      },
      error: function(xhr) {
        $('#errorMessageEditForm').show()
        $('#errorMessageEditForm').text(xhr.responseJSON.error)
      }
    })
  })
})
