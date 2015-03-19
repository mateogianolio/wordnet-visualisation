$(function() {
  var url = 'https://polar-coast-8848.herokuapp.com/',
      width = $('.container').width(),
      height = $('.container').height();

  var source = $('.source');
  
  console.log(source.width());
  source.css({
    left: (width / 2) - (source.width() / 2),
    top: (height / 2) - (source.height() / 2)
  });

  source.keypress(keypress);
  
  function keypress(event) {
    // enter key
    if(event.which === 13)
      search($(this).val());
  }
  
  function search(query) {
    if(!query)
      return;
    
    clear();
    
    var source = $('.source'),
        element,
        word,
        glossary,
        angle;
    
    source.addClass('rotate');
    $.get(url + query, function(nodes) {
      setTimeout(function() { source.removeClass('rotate') }, 300);
      nodes.forEach(function(node, i) {
        element = document.createElement('div');
        
        word = node.word.split('_').join(' ');
        glossary = node.glossary
          .split(';') // text after ';' is example(s)
          .shift(); // skip example (for now)
        angle = Math.atan(node.position.y / node.position.x);
        
        $(element)
          .css({
            position: 'absolute',
            opacity: 0,
            transform: 'rotate(' + angle + 'rad)'
          })
          .addClass('node')
          .addClass(node.type)
          .addClass('' + i)
          .html(word)
          .attr('data-glossary', glossary)
          .attr('data-word', word)
          .click(function() {
            var query = $(this).attr('data-word');
            source.val(query);
            search(query);
          });

        $('.container').append(element);
        
        

        // grab element again when it has been given width
        element = $('.' + i);
        
        var center = {
          x: (width / 2 - element.width() / 2),
          y: (height / 2 - element.height() / 2)
        }, target = {
          x: !(i % 2) ? ((width / 1.4) * node.position.x) : ((width / 1.2) * node.position.x),
          y: !(i % 2) ? ((height / 1.4) * node.position.y) : ((height / 1.2) * node.position.y)
        };
        
        var leaf,
            increment,
            j, y;
        
        // remove first synonym
        node.children.shift();
        
        for(j = 0; j < node.children.length; j++) {
          child = node.children[j];
          leaf = document.createElement('span');
          
          y = 48 + 20 * j;
          
          $(leaf)
            .css({
              position: 'absolute',
              left: 0,
              top: y,
            })
            .addClass('synonym')
            .addClass(node.type)
            .html(child.word.split('_').join(' '));
          
          $(element).append(leaf);
        }

        element
          .css({
            left: center.x,
            top: center.y
          })
          .animate({
            opacity: 1,
            left: '+=' + target.x,
            top: '+=' + target.y
          }, {
            duration: 500
          });
      });
    });
  }
  
  function clear() {
    $('.node').each(function() {
      var element = $(this);
      
      var center = {
        x: (width / 2 - element.width() / 2),
        y: (height / 2 - element.height() / 2)
      };
      
      element.animate({
        opacity: 0,
        left: center.x,
        top: center.y
      }, {
        duration: 300,
        complete: function() { $(this).remove() }
      });
    });
  }
});