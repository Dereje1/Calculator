var overFlowLimit=7; //Globally declare over flow limit as it is used by operator function
$(document).ready(function() {
          emptyScreen();
          //Initialize vaeriables
          var screenMajorValue = 0;//captures value in major scree
          var screenMinorValue = "";//captures value in minor screen as a string
          var operation=true;//boolean var used to see if an operation is active
          var resultArr=[0,0];//array with 2 elements used to store values[cummulative,pressed]
          var lastOperator="";//captures the last operator used

          
          //runs on click of any of the calc buttons
          $('.normbutton').click(function() {
            //capture button pressed
            var buttonHtml= $(this).html();
            //look out for screen overflow first, halt all functions as long as AC is not pressed
            //will not work for overflow >7 ??????
            if ($('#screenmajor').html().length >overFlowLimit){
              //countermeasure for numbers that are small but more than screen length
              //first check what type and if a valid number
              var checkDecimal = parseFloat($('#screenmajor').html());
              console.log(isNaN(checkDecimal))
              if(!isNaN(checkDecimal)&&!Number.isInteger(checkDecimal)){
                  //for small numbers just round it off and display on screen
                  var rounded = decimalHandler(checkDecimal);
                  overflowExceptions(rounded);
              }
              //counter measure for leading zeroes --> not to be counted as full blown integers
              else if(!isNaN(checkDecimal)&&Number.isInteger(checkDecimal)){
                //parseint will remove leading zeroes
                var fullInt = parseInt(checkDecimal,10);
                if (fullInt.toString().length<overFlowLimit){
                  overflowExceptions(fullInt);
                }
                else{
                  overflow();
                  if(buttonHtml!=="AC"){return;}
                }
              }
              else{
                //otherwise run overflow and lock out untill AC pressed 
                overflow();
                if(buttonHtml!=="AC"){return;}
              }
              
            }
            //for capturing only numerical or . buttons
            var pressedButton;
            //capture minor and major screen content , for major ensure that it is a number 
            screenMajorValue = parseFloat($('#screenmajor').html());
            screenMinorValue = $('#screenminor').html();
            //clause for decimal point
            if (buttonHtml==="."){pressedButton =".";}
            else{pressedButton = parseFloat(buttonHtml);}
            
            //if button is a number or decimal point then...
            if (!isNaN(pressedButton)||(pressedButton===".")){
                //if in the middle of an operation or value of major screen=0 empty screen
                if(operation){
                  $('#screenmajor').empty();
                    operation=false;
                }
                var screenMajorArr=$('#screenmajor').html().split('')
                //otherwise first test if only one decimal (point) is included
                var decimalInclude=screenMajorArr.includes('.');
                //if decimal point already exists on major screen do nothing 
                if ((pressedButton===".")&&decimalInclude){return;}
                //otherwise append the number/decimal point to major screen
                $('#screenminor').append(pressedButton);
                $('#screenmajor').append(pressedButton);
            }
            //Means button pressed is not a number/decimal point, means it is sometype of an operation
            else{
                operation=true;//set operation boolean
                //capture last character of Minor screen, useful to check if user has pressed on an
                //operation key more than once
                if (lastOperator==""){//length is differnt if the operation just began
                  var lastCharScreenMinor = screenMinorValue[screenMinorValue.length -1];
                }
                else{
                  var lastCharScreenMinor = screenMinorValue[screenMinorValue.length -2];
                }
                //check 3 conditions to check if any operation key has been pressed more than once
                //if last charcter is not a number and it is not decimal point and it is not equal op.
                if(isNaN(lastCharScreenMinor)&&(lastCharScreenMinor!==".")&&(buttonHtml!=="=")){
                  //if true remove previous operation and replace with current one
                  screenMinorValue=screenMinorValue.substr(0,screenMinorValue.length-2);
                  lastOperator=buttonHtml;
                }
                //operation only pressed once simply set pressed value to what is in the Major screen
                else{
                  
                resultArr[1]=screenMajorValue;
                }
              
                //check that operation is not "CE" and add operation to minor screen
                //note CE will have different requirement for minor screen display
                if(buttonHtml!=="CE"){
                  $('#screenminor').empty();
                  //add clause for scenario where screen minor is already clear and evaluation done
                  if(screenMinorValue.length===0){
                     $('#screenminor').append(screenMajorValue.toString() + " " + buttonHtml+" ");
                    }
                  else{
                     $('#screenminor').html(screenMinorValue+" "+buttonHtml+" ");
                   }
                }
                
                
                //go thru the various operation scenarios
                switch(buttonHtml){
                  //for ALl clear reset everything back to original state
                  case "AC":
                    resultArr[0]=0;
                    resultArr[1]=0;
                    lastOperator="";
                    emptyScreen();
                    break;
                  //For clear Entry reset back to last result
                  case "CE":
                    $('#screenmajor').empty();
                    $('#screenmajor').append(resultArr[0]);
                    
                    $('#screenminor').empty();
                    //keep buffer only as long as evaluation has not ended 
                    if((screenMinorValue.length!==0)&&lastOperator!==""){$('#screenminor').append("= "+resultArr[0]);}
                    //if screenminor is already clean no need to keep buffer clear all out
                    else{
                      resultArr[0]=0;
                      resultArr[1]=0;
                      emptyScreen();
                    }
                    lastOperator="";
                    break;
                  //for equals
                  case "=":
                    //evaluate lates cummulative val using last used operator to evaluate
                    resultArr[0] = operate(resultArr,lastOperator,lastOperator);
                    $('#screenminor').empty();
                    //$('#screenminor').append("= "+resultArr[0]);
                    //make sure to reset last operator to nothing
                    lastOperator="";
                    break;
                  //for all other cases i.e. mathematical ops(+,-,X,/)
                  default:
                    //if last character is a repeat operator do nothing (except for decimal point)
                    if (!isNaN(lastCharScreenMinor)||(lastCharScreenMinor===".")){
                     //other wise first check that last and current operator are the same
                     //this allows the cummulative result to be displayed when a new 
                     //operation is requested and finishes off the last operation started
                     if ((lastOperator!==buttonHtml)&&((lastOperator!==""))){
                        //finish off last operation started
                        resultArr[0] = operate(resultArr,lastOperator,lastOperator);
                        lastOperator=buttonHtml;
                        break;
                      }
                      //otherwise continue operation using currently pressed button
                      resultArr[0] = operate(resultArr,buttonHtml,lastOperator);
                      lastOperator=buttonHtml;
                    }
                }
            }
            
        });
});

//function for initializing screen
function emptyScreen(){
    $('#screenmajor').empty()
    $('#screenminor').empty()
    $('#screenmajor').html(0)
    $('#screenmajor').css({"color": "black"});
}

//this function computes a result given a mathematical operation
//Parmeters; arr = current 2 element array containing the cummulative and currently pressed numerical values
//operator = currently requested mathematical operation
//lastop= previously used operation
function operate(arr,operator,lastop){
  //for multiplication / division change into operation it can recognize from thr html
  
  if(operator==="×"){operator="*";}
  if(operator==="÷"){operator="/";}
  //if this is the first operation simply return the currently pressed val
  if(lastop===""){return arr[1];}
  //evaluate the operation
  var evaluation = eval(arr[0]+ operator +arr[1])

  evaluation = decimalHandler(evaluation);
  //below is an attempt to round off large numbers so that screen overflows will be limited
  //first check if it is already over the limit, note evaluation is now a string already
  
  if((evaluation.toString().length)>overFlowLimit){
    //next check if it is a decimal , if so...
    if (!(Number.isInteger(Number(evaluation)))){
      evaluation=Math.round(evaluation);
      //if it is still larger than the limit after rounding of to an integer then just return overflow
      if((evaluation.toString().length)>overFlowLimit){return overflow();}
      //if it is smaller than the limit return the result as an integer
      else{
        $('#screenmajor').empty();
        $('#screenmajor').append(Number(evaluation).toString());
        return Number(evaluation).toString();
      }
    }
    else{
      return overflow();
    }
  }
  //if it is not over the limit in the first place then just return the evaluation as is
  $('#screenmajor').empty();
  $('#screenmajor').append(Number(evaluation).toString());
  return Number(evaluation).toString();
}
//run only in overflow conditions;
function overflow(){
  $('#screenmajor').empty();
  $('#screenmajor').css({"color": "red"});
  $('#screenmajor').append("OVERFLOW");
  return "OVERFLOW";
}
//function ound of decimals based on screen size
function decimalHandler(num){
  //get length of whole number to find how many siginifcant digits to round off to
  var wholeNoLength= parseFloat(Math.round(num).toString().length)+1;
  //if not integer round off up to however much screen space left
  if (!(Number.isInteger(num))){return num.toFixed(overFlowLimit-wholeNoLength);}
  else{return num;}
}
//function used to adjust screen display for scenarios where an overflow may not be numerically so
function overflowExceptions(num){
      $('#screenmajor').empty();
      $('#screenmajor').append(num);
      //handle slightly different for screen minor as not to loose existing log
      var currentScreenMinor = $('#screenminor').html().split(' ');
      $('#screenminor').empty()
      //if screenminor already has content then handle differently
      if(currentScreenMinor.length>1){
        currentScreenMinor.pop();
        currentScreenMinor.push(num);
        $('#screenminor').append(currentScreenMinor.join(' '));
      }
      else{
        $('#screenminor').append(num);
      }
}