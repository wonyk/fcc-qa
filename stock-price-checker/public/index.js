$(function() {
  $('#stockSearch').submit(function(e) {
    e.preventDefault()
    $.get('/api/stock-prices', $('#stockSearch').serialize())
      .done(function(data) {
        let { stock, price, likes } = data.stockData
        $('#priceRow').removeClass('hidden')
        $('#jsonResult')
          .addClass('alert-primary')
          .removeClass('alert-danger')
        $('#jsonResult h4').text(stock)
        $('#jsonResult p').html('Price: $' + price + ' | Likes: ' + likes)
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        let err = JSON.parse(jqXHR.responseText)
        $('#priceRow').removeClass('hidden')
        $('#jsonResult')
          .addClass('alert-danger')
          .removeClass('alert-success')
        $('#jsonResult h4').text('An error Occured')
        $('#jsonResult p').html(err.error)
      })
  })

  $('#stockCompare').submit(function(e) {
    e.preventDefault()
    $.get('/api/stock-prices', $('#stockCompare').serialize())
      .done(function(data) {
      let html = data.stockData.map(d => {
          let likeCount = d.rel_likes >= 0 ? '+' + d.rel_likes : d.rel_likes 
          return `<li class="list-group-item list-group-item-primary"><h4 class="text-center">${d.stock}</h4><hr /><p class="mb-0">$${d.price} | ${likeCount} likes</p></li>`
        })
        console.log(html)
        $('#comparePrice').removeClass('hidden')
        $('#jsonCompare').html(html)
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        let err = JSON.parse(jqXHR.responseText)
        $('#comparePrice').removeClass('hidden')
        let html = `<li class="list-group-item list-group-item-danger"><h4 class="text-center">An Error Occured</h4><hr /><p class="mb-0">${err.error}</p></li>`
        $('#jsonCompare').html(html)
      })
  })
})
