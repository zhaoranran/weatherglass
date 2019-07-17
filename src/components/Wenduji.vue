<template>
    <div class="wenduji">
        <div id="centered">
            <!--add this line to the html where you want the thermometer-->

            <div id="goal-thermometer">
                <div id='therm-numbers'>
                </div>
                <div id='therm-graphics'>
                    <img id='therm-top' :src='glassTopImg'></img>
                    <img id='therm-body-bg' :src='glassBodyImg' ></img>
                    <img id='therm-body-mercury' :src='redVerticalImg'></img>
                    <div id='therm-body-fore'></div> 
                    <img id='therm-bottom' :src='glassBottomImg'></img>
                    <div id='therm-tooltip'>
                        <img class='tip-left' :src='tootipPointImg'></img>
                        <div class='tip-middle'><p>$0</p></div>
                        <img class='tip-right' :src='tooltipButtImg'></img>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>


<script>
import jq from '../assets/js/jquery'
//import goal from '../assets/js/goal-thermometer'
export default {
    data (){
        return {
           // currentAmount: 20,
            goalAmount: 100,//how much are you trying to get
            //var currentAmount = 1267;//how much do you currently have (if you want to define in js, not html)
            animationTime: 3000,//in milliseconds
            numberPrefix:"℃",//what comes before the number (set to "" if no prefix)
            numberSuffix: "",//what goes after the number
            tickMarkSegementCount: 4,//each segement adds 40px to the height
            widthOfNumbers: 50,//the width in px of the numbers on the left

            //standard resolution images
            glassTopImg: require("../assets/images/glassTop.png"),
            glassBodyImg: require("../assets/images/glassBody.png"),
            redVerticalImg: require("../assets/images/redVertical.png"),
            coldVerticalImg: require("../assets/images/coldVertical.png"),
            tooltipFGImg: require("../assets/images/tickShine.png"),
            glassBottomImg: require("../assets/images/glassBottom.png"),
            coldBottomImg: require("../assets/images/coldBottom.png"),
            tootipPointImg: require("../assets/images/tooltipPoint.png"),
            tooltipMiddleImg: require("../assets/images/tooltipMiddle.png"),
            tooltipButtImg: require("../assets/images/tooltipButt.png"),

            //high res images
            glassTopImg2x: require("../assets/images/glassTop2x.png"),
            glassBodyImg2x: require("../assets/images/glassBody2x.png"),
            redVerticalImg2x: require("../assets/images/redVertical2x.png"),
            coldVerticalImg2x: require("../assets/images/coldVertical2x.png"),
            tooltipFGImg2x: require("../assets/images/tickShine2x.png"),
            glassBottomImg2x: require("../assets/images/glassBottom2x.png"),
            coldBottomImg2x: require("../assets/images/coldBottom2x.png"),
            tootipPointImg2x: require("../assets/images/tooltipPoint2x.png"),
            tooltipMiddleImg2x: require("../assets/images/tooltipMiddle2x.png"),
            tooltipButtImg2x: require("../assets/images/tooltipButt2x.png"),

            /////////////////////////////////////////
            // ------ don't edit below here ------ //
            /////////////////////////////////////////

            arrayOfImages:"",
            imgsLoaded: 0,
            tickHeight: 40,
            mercuryHeightEmpty: 0,
            numberStartY: 6,
            thermTopHeight: 13,
            thermBottomHeight: 51,
            tooltipOffset: 15,
            heightOfBody: '',
            mercuryId: '',
            tooltipId: '',
            showAmount: '',
            resolution2x: false,
        }
    },
    props:[
        'currentAmount'
    ],
    mounted(){
        this.determineImageSet();
    },
    methods:{
        determineImageSet(){
            
            this.resolution2x = window.devicePixelRatio == 2;//check if resolution2x
            if(this.resolution2x){	
                //switch the regular for 2x res graphics
                this.glassTopImg = this.glassTopImg2x;
                this.glassBodyImg = this.glassBodyImg2x;
                this.redVerticalImg = this.redVerticalImg2x;
                this.coldVerticalImg = this.coldVerticalImg2x;
                this.glassBottomImg = this.glassBottomImg2x;
                this.coldBottomImg = this.coldBottomImg2x;
                this.tootipPointImg = this.tootipPointImg2x;
                this.tooltipButtImg = this.tooltipButtImg2x;	
            }
            
            if(this.currentAmount<0){
                this.redVerticalImg = this.coldVerticalImg;
                this.glassBottomImg = this.coldBottomImg;
            }

            this.showAmount=this.currentAmount;
            this.currentAmount = Math.abs(this.currentAmount);

            this.createGraphics();
        },
        createGraphics(){
            let _this = this;
            //preload and add the background images
            $('<img/>').attr('src', this.tooltipFGImg).load(function(){
                $(this).remove();
                $("#therm-body-fore").css("background-image", "url('"+_this.tooltipFGImg+"')");
                _this.checkIfAllImagesLoaded();
            });
            
            $('<img/>').attr('src', this.tooltipMiddleImg).load(function(){
                $(this).remove();
                $("#therm-tooltip .tip-middle").css("background-image", "url('" + _this.tooltipMiddleImg + "')");
                _this.checkIfAllImagesLoaded();
            });
            
            //adjust the css
            this.heightOfBody = this.tickMarkSegementCount * this.tickHeight;
            $("#therm-graphics").css("left", this.widthOfNumbers)
            $("#therm-body-bg").css("height", this.heightOfBody);
            $("#goal-thermometer").css("height",  this.heightOfBody + this.thermTopHeight + this.thermBottomHeight);
            $("#therm-body-fore").css("height", this.heightOfBody);
            $("#therm-bottom").css("top", this.heightOfBody + this.thermTopHeight);
            this.mercuryId = $("#therm-body-mercury");
            this.mercuryId.css("top", this.heightOfBody + this.thermTopHeight);
            this.tooltipId = $("#therm-tooltip");
            this.tooltipId.css("top", this.heightOfBody + this.thermTopHeight - this.tooltipOffset);
            
            //add the numbers to the left
            var numbersDiv = $("#therm-numbers");
            var countPerTick = this.goalAmount/this.tickMarkSegementCount;
            var commaSepCountPerTick = this.commaSeparateNumber(countPerTick);
            //add the number
            for ( var i = 0; i < this.tickMarkSegementCount; i++ ) {
                
                var yPos = this.tickHeight * i + this.numberStartY;
                var style = $("<style>.pos" + i + " { top: " + yPos + "px; width:"+this.widthOfNumbers+"px }</style>");
                $("html > head").append(style);
                var dollarText = this.commaSeparateNumber(this.goalAmount - countPerTick * i);
                if(this.showAmount<0){
                    dollarText= '-'+dollarText
                }
                $( numbersDiv ).append( "<div class='therm-number pos" + i + "'>" +dollarText+ "</div>" );
                
            }
            
            //check that the images are loaded before anything
            this.arrayOfImages = new Array( "#therm-top", "#therm-body-bg", "#therm-body-mercury", "#therm-bottom", ".tip-left", ".tip-right");
            this.preload(this.arrayOfImages);
            
        },
        preload(arrayOfImages) {
            var _this = this;
            for(var i=0;i<arrayOfImages.length;i++){
                $(arrayOfImages[i]).load(function() {   _this.checkIfAllImagesLoaded();  });
               _this.checkIfAllImagesLoaded();
            }
            
        },
        checkIfAllImagesLoaded(){
            var _this = this;
            this.imgsLoaded++;
            if(_this.imgsLoaded == _this.arrayOfImages.length+2){
                _this.animateThermometer();
                $("#goal-thermometer").fadeTo(1000, 1, function(){
                    _this.animateThermometer();
                });
            }
        },
        animateThermometer(){
            var _this = this;
            var percentageComplete = _this.currentAmount/_this.goalAmount;
            var mercuryHeight = Math.round(_this.heightOfBody * percentageComplete); 
            var newMercuryTop = _this.heightOfBody + _this.thermTopHeight - mercuryHeight;
            
            _this.mercuryId.animate({height:mercuryHeight +1, top:newMercuryTop }, _this.animationTime);
            _this.tooltipId.animate({top:newMercuryTop - _this.tooltipOffset}, {duration:_this.animationTime});
            
            var tooltipTxt = $("#therm-tooltip .tip-middle p");
            //change the tooltip number as it moves
            $({tipAmount: 0}).animate({tipAmount: _this.showAmount}, {
                duration:_this.animationTime,
                step:function(){
                    tooltipTxt.html(_this.commaSeparateNumber(this.tipAmount));
                }
            });
            
            
        },
        commaSeparateNumber(val){
            val = Math.round(val);
            while (/(\d+)(\d{3})/.test(val.toString())){
            val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
            }
            return   val + this.numberPrefix + this.numberSuffix;
        }
    }
}
</script>

<style lang="">
    @import '../assets/css/styles.css';
    @import '../assets/css/goal-thermometer.css';
</style>
