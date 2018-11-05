export default class ResultsTrendViewController{
    constructor($filter, openmrsRest, widgetsCommons) {
        'ngInject';

        Object.assign(this, { $filter, openmrsRest, widgetsCommons });
    }
    
    $onInit() {
    	this.vitalsSelected=[];
        this.fetchVitalsConcepts();
        this.fetchLabConcepts();
    	
        // Max age of obs to display
        this.maxAgeInDays = undefined;

        this.daysAgo=-1;
        // Concept info
        this.vitalConceptDisplay = {};
        this.labConceptDisplay={};

        // Vital Chart data
        this.vitalsMetaDataDict={};
        this.vitalGraphSeries = [];
        this.vitalChartLabels = [];
        this.vitalChartData = [[]];
        this.vitalChartObs = [[]];
        this.vitalsConceptsArray=[];
        this.vitalChartDatasetOverride = [];
        this.vitalChartOptions =  {
        		    scales: {
        		      yAxes: [],
        		      xAxes: []
        		    },
        		    annotation: {
        		    	annotations: []
        		    }
        		  };
        
     // lab Results Chart data
        this.labConceptDisplay;
        this.labMetaDataDict={};
        this.labChartSeries = [];
        this.labChartLabels = [];
        this.labChartData = [[]];
        this.labChartObs = [];
        this.labSelectedConceptId;
        this.labConceptsArray=[];
        this.labChartDatasetOverride = [];
        this.labChartOptions =  {
        		    scales: {
        		      yAxes: [],
        		      xAxes: []
        		    },
        		    annotation: {
        		    	annotations: []
        		    }
        		  };
        // Parse maxAge to day count
        this.maxAgeInDays = this.widgetsCommons.maxAgeToDays(this.config.maxAge);
    }
    
    generateLabResultsChart(){
    	console.log("Selected " + this.labSelectedConceptId);
    	console.log("days: "+this.daysAgo);
    	this.labChartLabels = [];
    	this.labChartData = [[]];
    	this.labChartSeries = [];
    	this.openmrsRest.list('obs',{ patient: this.config.patientUuid, v: 'full', limit: this.config.maxResults, concept: this.labSelectedConceptId }).then((resp) => {
            console.log(resp.results);
    		const obss = resp.results;
            this.labChartObs = obss;
            if (obss.length > 0) {
                // Set concept to display
                this.labConceptDisplay = obss[0].concept;
                this.labChartSeries.push(this.labConceptDisplay.display);
                for (let i = 0; i < obss.length; i++) {
                    let obs = obss[i];
                    // Show numeric concepts only
                    if (obs.concept.datatype.display == 'Numeric') {
                        // Don't add obs older than maxAge
                        if (angular.isUndefined(this.maxAgeInDays) || (this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= this.maxAgeInDays)) {
                            if(this.daysAgo == -1 || this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= parseInt(this.daysAgo)){
	                        	// Add obs data for chart display
	                            var date = this.$filter('date')(new Date(obs.obsDatetime), this.config.dateFormat);
	                            this.labChartLabels.unshift(date);
	                            this.labChartData[0].unshift(obs.value);
	                            console.log(i);
                            }
                        }
                    }
                }
                if(this.labChartLabels.length > 0){
	                console.log("DATA: "+this.labChartData.length);
	                if(angular.equals(this.labChartOptions,{})){
	                	this.labChartOptions.scales={};
	                	this.labChartOptions.scales.yAxes=[];
	                }
	                let yAxisId='y-axis-0';
	                this.labChartDatasetOverride.push({'yAxisID':yAxisId});
	                this.labChartOptions.scales.yAxes.push({scaleLabel:{display:true,labelString:this.labMetaDataDict[this.labConceptDisplay.uuid].shortName + ' ('+this.labMetaDataDict[this.labConceptDisplay.uuid].unit+')'},id:yAxisId,type:'linear',display:true,position:'left'});
	                console.log(this.labGraphSeries);
	                if( ('hiAbs' in this.labMetaDataDict[this.labConceptDisplay.uuid]) && this.labMetaDataDict[this.labConceptDisplay.uuid].hiAbs != null){
	                	if(angular.equals(this.labChartOptions,{})){
		                	this.labChartOptions.annotation={};
		                	this.labChartOptions.annotation.annotations=[];
	                	}
	                	this.labChartOptions.annotation.annotations.push({type:'line',mode:'horizontal',scaleID:'y-axis-0',borderDash: [2, 2],borderDashOffset: 5,value:this.labMetaDataDict[this.labConceptDisplay.uuid].hiAbs,borderColor:'red',borderWidth:2,'label':{position:'top',backgroundColor: 'rgba(255,0,0,1)',fontStyle: 'bold',enabled: true, content: this.labMetaDataDict[this.labConceptDisplay.uuid].shortName+" - high:"+this.labMetaDataDict[this.labConceptDisplay.uuid].hiAbs} });
	            	}
			    	if( ('lowAbs' in this.labMetaDataDict[this.labConceptDisplay.uuid]) && this.labMetaDataDict[this.labConceptDisplay.uuid].lowAbs != null){
			    		if(angular.equals(this.labChartOptions,{})){
		                	this.labChartOptions.annotation={};
		                	this.labChartOptions.annotation.annotations=[];
	                	}
			    		this.labChartOptions.annotation.annotations.push({type:'line',mode:'horizontal',scaleID:'y-axis-0',borderDash: [2, 2],borderDashOffset: 5,value:this.labMetaDataDict[this.labConceptDisplay.uuid].lowAbs,borderColor:'red',borderWidth:2,'label':{position:'top',backgroundColor: 'rgba(0,255,0,0.3)',fontStyle: 'bold',enabled: true, content: this.labMetaDataDict[this.labConceptDisplay.uuid].shortName+" - low:"+this.labMetaDataDict[this.labConceptDisplay.uuid].lowAbs}});
		        	}
                }
                console.log(this.labChartSeries);
        		if(!(angular.equals(this.labChartOptions,{}))){
        			this.labChartOptions.scales.xAxes=[];
        	        this.labChartOptions.scales.xAxes.push({scaleLabel:{display:true, labelString:'Date of Obs'}});
        		}
            }
        })        
    }
    
    generateVitalsChart(){
    	console.log("Selected " + this.vitalsSelected);
    	this.vitalChartLabels = [];
    	this.vitalChartData = [[]];
    	this.vitalGraphSeries = [];
    	this.vitalChartDatasetOverride=[];
    	this.vitalChartOptions =  {
    		    scales: {
    		      yAxes: [],
    		      xAxes: []
    		    },
    		    annotation: {
    		    	annotations: []
    		    }
    		  };
    	console.log(this.vitalsSelected.length);
    	for(let i=0; i<this.vitalsSelected.length; i++){
    		this.vitalChartData[i]=[];
	    	this.openmrsRest.list('obs',{ patient: this.config.patientUuid, v: 'full', limit: this.config.maxResults, concept: this.vitalsSelected[i] }).then((resp) => {
	            console.log(resp.results);
	    		const obss = resp.results;
	    		this.vitalChartObs[i]=[];
	            this.vitalChartObs[i] = obss;
	            if (obss.length > 0) {
	                // Set concept to display
	                this.vitalConceptDisplay = obss[0].concept;
	                console.log(this.vitalConceptDisplay);
	                this.vitalGraphSeries.push(this.vitalConceptDisplay.display);
	                for (let j = 0; j < obss.length; j++) {
	                    let obs = obss[j];
	                    // Show numeric concepts only
	                    if (obs.concept.datatype.display == 'Numeric') {
	                        // Don't add obs older than maxAge
	                        if (angular.isUndefined(this.maxAgeInDays) || (this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= this.maxAgeInDays)) {
	                            if(this.daysAgo == -1 || this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= parseInt(this.daysAgo)){
		                        	// Add obs data for chart display
		                            var date = this.$filter('date')(new Date(obs.obsDatetime), this.config.dateFormat);
		                            /*if(this.vitalChartLabels.indexOf(date) == -1){
		                            	this.vitalChartLabels.unshift(date);
		                            }*/
		                            if( i === 0){
		                            	this.vitalChartLabels.unshift(date);
		                            }
		                            this.vitalChartData[i].unshift(obs.value);
		                            console.log("Data["+i+"]["+j+"] = "+this.vitalChartData[i][j]);
	                            }
	                        }
	                    }
	                }
	                console.log("DATA: "+this.vitalChartData.length);
	                if(angular.equals(this.vitalChartOptions,{})){
	                	this.vitalChartOptions.scales={};
	                	this.vitalChartOptions.scales.yAxes=[];
	                }
	                let yAxisId='y-axis-'.concat(i);
	                this.vitalChartDatasetOverride.push({'yAxisID':yAxisId});
	                this.vitalChartOptions.scales.yAxes.push({scaleLabel:{display:true,labelString:this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].shortName + ' ('+this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].unit+')'},id:yAxisId,type:'linear',display:true,position:(i === 0 ? 'left' : 'right')});
	                console.log(this.vitalGraphSeries);
	                if( ('hiAbs' in this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid]) && this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].hiAbs != null){
	                	if(angular.equals(this.vitalChartOptions,{})){
		                	this.vitalChartOptions.annotation={};
		                	this.vitalChartOptions.annotation.annotations=[];
	                	}
	                	this.vitalChartOptions.annotation.annotations.push({type:'line',mode:'horizontal',scaleID:(i===0 ? 'y-axis-0' : 'y-axis-1'),borderDash: [2, 2],borderDashOffset: 5,value:this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].hiAbs,borderColor:'red',borderWidth:2,'label':{position:'top',backgroundColor: 'rgba(255,0,0,1)',fontStyle: 'bold',enabled: true, content: this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].shortName+" - high:"+this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].hiAbs} });
	            	}
			    	if( ('lowAbs' in this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid]) && this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].lowAbs != null){
			    		if(angular.equals(this.vitalChartOptions,{})){
		                	this.vitalChartOptions.annotation={};
		                	this.vitalChartOptions.annotation.annotations=[];
	                	}
			    		this.vitalChartOptions.annotation.annotations.push({type:'line',mode:'horizontal',scaleID:(i===0 ? 'y-axis-0' : 'y-axis-1'),borderDash: [2, 2],borderDashOffset: 5,value:this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].lowAbs,borderColor:'red',borderWidth:2,'label':{position:'top',backgroundColor: 'rgba(0,255,0,0.3)',fontStyle: 'bold',enabled: true, content: this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].shortName+" - low:"+this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].lowAbs}});
		        	}
	        }        
    	})
    	}
		if(!(angular.equals(this.vitalChartOptions,{}))){
			this.vitalChartOptions.scales.xAxes=[];
	        this.vitalChartOptions.scales.xAxes.push({scaleLabel:{display:true, labelString:'Date of Obs'}});
		}
    }
    
    vitalsOnTimePeriodSelected(){
    	console.log("days: "+this.daysAgo);
    	this.vitalGraphSeries=[];
    	this.vitalChartLabels=[];
    	this.vitalChartData=[[]];

    	if (this.vitalChartObs.length > 0) {
    		for(let i=0; i<this.vitalChartObs.length; i++){
        		this.vitalChartData[i]=[];
    			if(this.vitalChartObs[i].length > 0){
	                for (let j = 0; j < this.vitalChartObs[i].length; j++) {
	    				// Set concept to display
		                this.vitalConceptDisplay = this.vitalChartObs[i][j].concept;
		                console.log(this.vitalConceptDisplay);
		                this.vitalGraphSeries.push(this.vitalConceptDisplay.display);
	                    let obs = this.vitalChartObs[i][j];
	                    // Show numeric concepts only
	                    if (obs.concept.datatype.display == 'Numeric') {
	                        // Don't add obs older than maxAge
	                        if (angular.isUndefined(this.maxAgeInDays) || (this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= this.maxAgeInDays)) {
	                            if(this.daysAgo == -1 || this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= parseInt(this.daysAgo)){
		                        	// Add obs data for chart display
		                            var date = this.$filter('date')(new Date(obs.obsDatetime), this.config.dateFormat);
		                            /*if(this.vitalChartLabels.indexOf(date) == -1){
		                            	this.vitalChartLabels.unshift(date);
		                            }*/
		                            if(i === 0){
		                            	this.vitalChartLabels.unshift(date);
		                            }
		                            this.vitalChartData[i].unshift(obs.value);
		                            console.log("Data["+i+"]["+j+"] = "+this.vitalChartData[i][j]);
	                            }
	                        }
	                    }
	                }
    		}
        }
    }
    }
    
    labOnTimePeriodSelected(){
    	console.log("days: "+this.daysAgo);
    	this.labChartSeries=[];
    	this.labChartLabels=[];
    	this.labChartData=[[]];

    	if (this.labChartObs.length > 0) {
            // Set concept to display
            this.labConceptDisplay = this.labChartObs[0].concept;
            this.labChartSeries.push(this.labConceptDisplay.display);
            for (let i = 0; i < this.labChartObs.length; i++) {
                let obs = this.labChartObs[i];
                // Show numeric concepts only
                if (obs.concept.datatype.display == 'Numeric') {
                    // Don't add obs older than maxAge
                    if (angular.isUndefined(this.maxAgeInDays) || (this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= this.maxAgeInDays)) {
                        if(this.daysAgo == -1 || this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= parseInt(this.daysAgo)){
                        	// Add obs data for chart display
                            var date = this.$filter('date')(new Date(obs.obsDatetime), this.config.dateFormat);
                            this.labChartLabels.unshift(date);
                            this.labChartData[0].unshift(obs.value);
                            console.log(i);
                        }
                    }
                }
            }
    	}
    }
    
    fetchVitalsConcepts() {
        this.openmrsRest.getFull("concept/" + '106411d9-f354-4160-8603-4dec659d1bb6', {v: 'custom:(uuid,display,names:(display,conceptNameType)'}).then((concept) => {
        	console.log(concept);
        	angular.forEach(concept.setMembers, (concept) => {
        		this.openmrsRest.getFull("concept/" + concept.uuid, {v: 'custom:(uuid,display,names:(display,conceptNameType)'}).then((fullConcept) => {
	            	console.log("concept Vitals: "+fullConcept.units);
	                let cShort = this.getConceptWithShortName(fullConcept);
	            	this.vitalsMetaDataDict[cShort.uuid]={'hiAbs':cShort.hiNormal,'lowAbs':cShort.lowNormal,'unit':cShort.units,'shortName':cShort.display};
	                if(cShort.datatype.display == 'Numeric'){
	                	this.vitalsConceptsArray.push([cShort.uuid,cShort.display]);
	                }
        		});

            });
        });
        console.log("vitals MetaDataDict: " + this.vitalsMetaDataDict);
    }
    
    fetchLabConcepts() {
        this.openmrsRest.getFull("concept/" + '23281464-74d8-47d9-9a39-7a1f1d7caa4f', {v: 'custom:(uuid,display,names:(display,conceptNameType)'}).then((concept) => {
        	angular.forEach(concept.setMembers, (concept) => {
        		this.openmrsRest.getFull("concept/" + concept.uuid, {v: 'custom:(uuid,display,names:(display,conceptNameType)'}).then((fullConcept) => {
	            	console.log("concept Lab: "+fullConcept.units);
	                let cShort = this.getConceptWithShortName(fullConcept);
	            	this.labMetaDataDict[cShort.uuid]={'hiAbs':cShort.hiNormal,'lowAbs':cShort.lowNormal,'unit':cShort.units,'shortName':cShort.display};
	                if(concept.datatype.display == 'Numeric'){
	                	this.labConceptsArray.push([cShort.uuid,cShort.display]);
	                }
        		});
            });
        });
        console.log("vitals MetaDataDict: " + this.labMetaDataDict);
    }
    
    getConfigConceptsAsArray(commaDelimitedConcepts) {
        return commaDelimitedConcepts.replace(" ", "").split(",");
    }

    getConceptWithShortName(concept) {
        angular.forEach(concept.names, (name) => {
            if(name.conceptNameType == 'SHORT'){
                concept.display = name.display;
            }
        });
        return concept;
    }
    
    onTimePeriodChanged(){
    	this.vitalsOnTimePeriodSelected();
    	this.labOnTimePeriodSelected();
    }
}