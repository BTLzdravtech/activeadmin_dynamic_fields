// Evaluate a condition
function dfEvalCondition(el, args, on_change) {
  if(args.fn) {
    if(args.fn && window[args.fn]) return !window[args.fn](el);
    else console.log('Warning - activeadmin_dynamic_fields: ' + args.fn + '() not available [1]');
  }
  else if(args.if == 'checked') {
    return el.parent().find('input[type=checkbox]').is(':checked');
  }
  else if(args.if == 'not_checked') {
    return !el.parent().find('input[type=checkbox]').is(':checked');
  }
  else if(args.if == 'blank') {
    return el.val().length === 0 || !el.val().trim();
  }
  else if(args.if == 'not_blank') {
    return el.val().length !== 0 && el.val().trim();
  }
  else if(args.if == 'changed') {
    return on_change;
  }
  else if(args.eq) {
    if (args.eq.indexOf('|') == -1) {
      if (el.val() == undefined || el.val() == null || el.val() == "") {
        return -1;
      } else {
        if (args.eq.indexOf(',') == -1) {
          return el.val() == args.eq;
        } else {
          var result = false;
          $.each(args.eq.split(','), function(index, item) {
            if (item == el.val()) {
              result = true;
              return false;
            }
          })
          return result;
        }
      }
    } else {
      // show all - result = -2
      // hide all - result = -1
      var result = -2;
      var targetAll;
      var multiArgs = args.eq.split('|');
      if (el.val() == undefined || el.val() == null || el.val() == "") {
        return -1;
      }
      $.each(multiArgs, function(index, item) {
        if (item.indexOf(',') == -1) {
          targetAll = false;
          if (item.startsWith('*')) {
            targetAll = true;
            item = item.substr(1);
          }
          if (item == el.val()) {
            if (targetAll) {
              result = -1;
            } else {
              result = index;
            }
            return false;
          }
        } else {
          var foundInSplits = false;
          $.each(item.split(','), function(index2, item2) {
            targetAll = false;
            if (item2.startsWith('*')) {
              targetAll = true;
              item2 = item2.substr(1);
            }
            if (item2 == el.val()) {
              if (targetAll) {
                result = -1;
                foundInSplits = true;
              } else {
                result = index;
                foundInSplits = true;
              }
              return false;
            }
          })
          if (foundInSplits) {
            return false;
          }
        }
      });
      return result;
    }
  }
  else if(args.not) {
    return el.val() != args.not;
  }
  return undefined;
}

// Prepare a field
function dfSetupField(el) {
  var action = el.data('action');
  var target, dataTarget, args = {};
  args.if = el.data('if');
  args.eq = el.data('eq');
  args.not = el.data('not');
  args.fn = el.data('function');
  if(el.data('target')) {
    dataTarget = el.data('target');
    if (dataTarget.indexOf('|') == -1) {
      target = el.closest('form').find(dataTarget);
    } else {
      target = [];
      $.each(dataTarget.split('|'), function(index, item) {
        target.push(item);
      });
    }
  }
  else if(el.data('gtarget')) {
    target = $(el.data('gtarget'));
  }
  if(action == 'hide') {
    var isInAccordion = false
    var accordion = el.closest('.easyui-accordion')
    if (accordion.length) {
      isInAccordion = accordion.accordion('getPanelIndex', accordion.accordion('getSelected')) !== accordion.accordion('getPanelIndex', accordion.accordion('getPanel', el.closest('.panel').find('.panel-title').text()))
    }
    if (el.closest('li').is(':visible') || isInAccordion) {
      var result = dfEvalCondition(el, args, false);
      if (typeof result === "boolean") {
        if ($.isArray(target)) {
          $.each(target, function (index, item) {
            if (index > 0) {
              result = !result
            }
            var targetFromArray = el.closest('form').find(item)
            if (targetFromArray.css('display') !== 'none') {
              var validateBoxes = targetFromArray.find('.validatebox-text')
              if (result) {
                targetFromArray.hide();
                validateBoxes.each(function () {
                  if ($(this).validatebox('options').required == true) {
                    $(this).validatebox('options').novalidate = true
                  }
                })
              } else {
                targetFromArray.show();
                targetFromArray.find('.textbox-f').textbox('resize')
                targetFromArray.find('[data-if], [data-function], [data-eq], [data-not]').trigger('change');
                validateBoxes.each(function () {
                  if ($(this).validatebox('options').required == true) {
                    $(this).validatebox('options').novalidate = false
                  }
                })
              }
            }
          })
        } else {
          if (target.css('display') !== 'none') {
            var validateBoxes = target.find('.validatebox-text')
            if (result) {
              target.hide();
              validateBoxes.each(function() {
                if ($(this).validatebox('options').required == true) {
                  $(this).validatebox('options').novalidate = true
                }
              })
            } else {
              target.show();
              target.find('.textbox-f').textbox('resize')
              target.find('[data-if], [data-function], [data-eq], [data-not]').trigger('change');
              validateBoxes.each(function() {
                if ($(this).validatebox('options').required == true) {
                  $(this).validatebox('options').novalidate = false
                }
              })
            }
          }
        }
      } else if (typeof result === "number") {
        var target_array = [].concat(target)
        if (result > -1) {
          target_array.push(target_array.splice(result, 1)[0])
          result = target_array.length - 1
        }
        $.each(target_array, function (index, item) {
          var targetFromArray = el.closest('form').find(item)
          if (targetFromArray.css('display') !== 'none') {
            var validateBoxes = targetFromArray.find('.validatebox-text')
            if (index == result || result == -1) {
              targetFromArray.hide();
              validateBoxes.each(function () {
                if ($(this).validatebox('options').required == true) {
                  $(this).validatebox('options').novalidate = true
                }
              })
            } else {
              targetFromArray.show();
              targetFromArray.find('.textbox-f').textbox('resize')
              targetFromArray.find('[data-if], [data-function], [data-eq], [data-not]').trigger('change');
              validateBoxes.each(function () {
                if ($(this).validatebox('options').required == true) {
                  $(this).validatebox('options').novalidate = false
                }
              })
            }
          }
        });
      }
    }
    el.on('change', function(event) {
      var result = dfEvalCondition($(this), args, true);
      if (typeof result === "boolean") {
        if ($.isArray(target)) {
          $.each(target, function (index, item) {
            if (index > 0) {
              result = !result
            }
            var targetFromArray = el.closest('form').find(item)
            var validateBoxes = targetFromArray.find('.validatebox-text')
            if (result) {
              targetFromArray.hide();
              validateBoxes.each(function () {
                if ($(this).validatebox('options').required == true) {
                  $(this).validatebox('options').novalidate = true
                }
              })
            } else {
              targetFromArray.show();
              targetFromArray.find('.textbox-f').textbox('resize')
              targetFromArray.find('[data-if], [data-function], [data-eq], [data-not]').trigger('change');
              validateBoxes.each(function () {
                if ($(this).validatebox('options').required == true) {
                  $(this).validatebox('options').novalidate = false
                }
              })
            }
          })
        } else {
          var validateBoxes = target.find('.validatebox-text')
          if (result) {
            target.hide()
            validateBoxes.each(function () {
              if ($(this).validatebox('options').required == true) {
                $(this).validatebox('options').novalidate = true
              }
            })
          } else {
            target.show()
            target.find('.textbox-f').textbox('resize')
            target.find('[data-if], [data-function], [data-eq], [data-not]').trigger('change');
            validateBoxes.each(function () {
              if ($(this).validatebox('options').required == true) {
                $(this).validatebox('options').novalidate = false
              }
            })
          }
        }
      } else if(typeof result === "number") {
        var target_array = [].concat(target)
        if (result > -1) {
          target_array.push(target_array.splice(result, 1)[0])
          result = target_array.length - 1
        }
        $.each(target_array, function(index, item) {
          var targetFromArray = el.closest('form').find(item)
          var validateBoxes = targetFromArray.find('.validatebox-text')
          if (index == result || result == -1) {
            targetFromArray.hide();
            validateBoxes.each(function() {
              if ($(this).validatebox('options').required == true) {
                $(this).validatebox('options').novalidate = true
              }
            })
          } else {
            targetFromArray.show();
            targetFromArray.find('.textbox-f').textbox('resize')
            targetFromArray.find('[data-if], [data-function], [data-eq], [data-not]').trigger('change');
            validateBoxes.each(function() {
              if ($(this).validatebox('options').required == true) {
                $(this).validatebox('options').novalidate = false
              }
            })
          }
        });
      }
    });
  }
  else if(action == 'slide') {
    var result = dfEvalCondition(el, args, false);
    if (typeof result === "boolean"){
      result ? target.slideDown() : target.slideUp()
    } else if(typeof result === "number") {
      target.each(function(index) {
        index == result ? target.eq(index).slideDown() : target.eq(index).slideUp()
      });
    }
    el.on('change', function(event) {
      var result = dfEvalCondition($(this), args, true);
      if (typeof result === "boolean"){
        result ? target.slideDown() : target.slideUp()
      } else if(typeof result === "number") {
        target.each(function(index) {
          index == result ? target.eq(index).slideDown() : target.eq(index).slideUp()
        });
      }
    });
  }
  else if(action == 'fade') {
    var result = dfEvalCondition(el, args, false);
    if (typeof result === "boolean"){
      result ? target.fadeIn() : target.fadeOut()
    } else if(typeof result === "number") {
      target.each(function(index) {
        index == result ? target.eq(index).fadeIn() : target.eq(index).fadeOut()
      });
    }
    el.on('change', function(event) {
      var result = dfEvalCondition($(this), args, true);
      if (typeof result === "boolean"){
        result ? target.fadeIn() : target.fadeOut()
      } else if(typeof result === "number") {
        target.each(function(index) {
          index == result ? target.eq(index).fadeIn() : target.eq(index).fadeOut()
        });
      }
    });
  }
  else if(action.substr(0, 8) == 'setValue') {
    var val = action.substr(8).trim();
    var result = dfEvalCondition(el, args, false);
    if (typeof result === "boolean"){
      if (result) dfSetValue(target, val);
    } else if(typeof result === "number") {
      target.each(function(index) {
        if (index == result) dfSetValue(target.eq(index), val);
      });
    }
    el.on('change', function(event) {
      var result = dfEvalCondition($(this), args, true);
      if (typeof result === "boolean"){
        if (result) dfSetValue(target, val);
      } else if(typeof result === "number") {
        target.each(function(index) {
          if (index == result) dfSetValue(target.eq(index), val);
        });
      }
    });
  }
  else if(action.substr(0, 8) == 'callback') {
    var cb = action.substr(8).trim();
    if(cb && window[cb]) {
      if(dfEvalCondition(el, args, false)) window[cb](el.data('args'));
      el.on('change', function(event) {
        if(dfEvalCondition($(this), args, true)) window[cb](el.data('args'));
      });
    }
    else console.log('Warning - activeadmin_dynamic_fields: ' + cb + '() not available [2]');
  }
  else if(action.substr(0, 8) == 'addClass') {
    var classes = action.substr(8).trim();
    var result = dfEvalCondition(el, args, false);
    if (typeof result === "boolean"){
      result ? target.removeClass(classes) : target.addClass(classes)
    } else if(typeof result === "number") {
      target.each(function(index) {
        index == result ? target.eq(index).fadeIn() : target.eq(index).fadeOut()
      });
    }
    el.on('change', function(event) {
      var result = dfEvalCondition($(this), args, true);
      if (typeof result === "boolean"){
        result ? target.removeClass(classes) : target.addClass(classes)
      } else if(typeof result === "number") {
        target.each(function(index) {
          index == result ? target.eq(index).removeClass(classes) : target.eq(index).addClass(classes)
        });
      }
    });
  }
  else if(args.fn) {  // function without action
    dfEvalCondition(el, args, false);
    el.on('change', function(event) {
      dfEvalCondition(el, args, true);
    });
  }
}

// Set the value of an element
function dfSetValue(el, val) {
  if(el.attr('type') != 'checkbox') el.val(val);
  else el.prop('checked', val == '1');
  el.trigger('change');
}

// Inline update - must be called binded on the editing element
function dfUpdateField() {
  if($(this).data('loading') != '1') {
    $(this).data('loading', '1');
    var _this = $(this);
    var type = $(this).data('field-type');
    var new_value;
    if(type == 'boolean') new_value = !$(this).data('field-value');
    else if(type == 'select') new_value = $(this).val();
    else new_value = $(this).text();
    var data = {};
    data[$(this).data('field')] = new_value;
    $.ajax({
      context: _this,
      data: { data: data },
      method: 'POST',
      url: $(this).data('save-url'),
      complete: function(req, status) {
        $(this).data('loading', '0');
      },
      success: function(data, status, req) {
        if(data.status == 'error') {
          if($(this).data('show-errors')) {
            var result = '';
            var message = data.message;
            for(var key in message) {
              if(typeof(message[key]) === 'object') {
                if(result) result += ' - ';
                result += key + ': ' + message[key].join('; ');
              }
            }
            if(result) alert(result);
          }
        }
        else {
          $(this).data('field-value', new_value);
          if($(this).data('content')) {
            var old_text = $(this).text();
            var old_class = $(this).attr('class');
            var content = $($(this).data('content'));
            $(this).text(content.text());
            $(this).attr('class', content.attr('class'));
            content.text(old_text);
            content.attr('class', old_class);
            $(this).data('content', content);
          }
        }
      }
    });
  }
}

// Init
function initDynamicFields() {
  // Setup dynamic fields
  $('.active_admin .inputs [data-if], .active_admin .inputs [data-function], .active_admin .inputs [data-eq], .active_admin .inputs [data-not]').each(function() {
    dfSetupField($(this));
  });
  // Setup dynamic fields for has many associations
  $('.active_admin .has_many_container').on('has_many_add:after', function(e, fieldset, container) {
    $('.active_admin .inputs [data-if], .active_admin .inputs [data-function], .active_admin .inputs [data-eq], .active_admin .inputs [data-not]').each(function() {
      dfSetupField($(this));
    });
  });
  // Set dialog icon link
  $('.active_admin [data-df-icon]').each(function() {
    $(this).append(' &raquo;');  // ' &bullet;'
  });
  // Open content in dialog
  $('.active_admin [data-df-dialog]').on('click', function(event) {
    event.preventDefault();
    $(this).blur();
    if($('#df-dialog').data('loading') != '1') {
      $('#df-dialog').data('loading', '1');
      if($('#df-dialog').length == 0) $('body').append('<div id="df-dialog"></div>');
      var title = $(this).attr('title');
      $.ajax({
        url: $(this).attr('href'),
        complete: function(req, status) {
          $('#df-dialog').data('loading', '0');
        },
        success: function(data, status, req) {
          if(title) $('#df-dialog').attr('title', title);
          $('#df-dialog').html(data);
          $('#df-dialog').dialog({ modal: true });
        },
      });
    }
  });
  // Inline editing
  $('[data-field][data-field-type="boolean"][data-save-url]').each(function() {
    $(this).on('click', $.proxy(dfUpdateField, $(this)));
  });
  $('[data-field][data-field-type="string"][data-save-url]').each(function() {
    $(this).data('field-value', $(this).text());
    var fnUpdate = $.proxy(dfUpdateField, $(this));
    $(this).on('blur', function() {
      if($(this).data('field-value') != $(this).text()) fnUpdate();
    });
  });
  $('[data-field][data-field-type="select"][data-save-url]').each(function() {
    $(this).on('change', $.proxy(dfUpdateField, $(this)));
  });
}
