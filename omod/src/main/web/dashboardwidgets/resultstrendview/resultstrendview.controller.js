export default class ResultsTrendViewController{
    constructor($filter, openmrsRest, widgetsCommons) {
        'ngInject';

        Object.assign(this, { $filter, openmrsRest, widgetsCommons });
    }
    
    $onInit() {
        this.initializeVitalsVariables();
        this.initializeLabResultsVariables();
        this.initializeGeneralVariables();
        this.openmrsRest.setBaseAppPath("/coreapps");

        this.fetchVitalsConcepts();
        this.fetchLabConcepts();
    }
    
    generateLabResultsChart(){
    	this.resetLabResultsVariables();
    	this.openmrsRest.list('obs',{ patient: this.config.patientUuid, v: 'full', limit: this.config.maxResults, concept: this.labSelectedConceptId }).then((resp) => {
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
                            if(this.daysAgo == "all" || this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= parseInt(this.daysAgo)){
	                        	// Add obs data for chart display
	                            var date = this.$filter('date')(new Date(obs.obsDatetime), this.config.dateFormat);
	                            this.labChartLabels.unshift(date);
	                            this.labChartData[0].unshift(obs.value);
                            }
                        }
                    }
                }
                if(this.labChartLabels.length > 0){
	                let yAxisId='y-axis-0';
	                this.labChartDatasetOverride.push({'yAxisID':yAxisId});
	                this.labChartOptions.scales.yAxes.push({ticks:{beginAtZero:true},scaleLabel:{display:true,labelString:this.labMetaDataDict[this.labConceptDisplay.uuid].shortName + (this.unitIsEmpty(this.labMetaDataDict[this.labConceptDisplay.uuid].unit) ? '' : (' ('+this.labMetaDataDict[this.labConceptDisplay.uuid].unit+')')) },id:yAxisId,type:'linear',display:true,position:'left'});
	                if( ('hiNormal' in this.labMetaDataDict[this.labConceptDisplay.uuid]) && this.labMetaDataDict[this.labConceptDisplay.uuid].hiNormal != null){
	                	this.labChartOptions.annotation.annotations.push({type:'line',mode:'horizontal',scaleID:'y-axis-0',borderDash: [2, 2],borderDashOffset: 5,value:this.labMetaDataDict[this.labConceptDisplay.uuid].hiNormal,borderColor:'rgba(255,0,0,1)',borderWidth:2,'label':{position:'top',backgroundColor: 'rgba(255,0,0,1)',fontStyle: 'bold',enabled: true, content: this.labMetaDataDict[this.labConceptDisplay.uuid].shortName+" - high:"+this.labMetaDataDict[this.labConceptDisplay.uuid].hiNormal} });
	            	}
			    	if( ('lowNormal' in this.labMetaDataDict[this.labConceptDisplay.uuid]) && this.labMetaDataDict[this.labConceptDisplay.uuid].lowNormal != null){
			    		this.labChartOptions.annotation.annotations.push({type:'line',mode:'horizontal',scaleID:'y-axis-0',borderDash: [2, 2],borderDashOffset: 5,value:this.labMetaDataDict[this.labConceptDisplay.uuid].lowNormal,borderColor:'rgba(51,255,0,0.2)',borderWidth:2,'label':{position:'top',backgroundColor: 'rgba(51,255,0,0.2)',fontStyle: 'bold',enabled: true, content: this.labMetaDataDict[this.labConceptDisplay.uuid].shortName+" - low:"+this.labMetaDataDict[this.labConceptDisplay.uuid].lowNormal}});
		        	}
                }
                this.labChartOptions.scales.xAxes.push({scaleLabel:{display:true, labelString:'Date of Obs'}});
            }
        })        
    }
    
    generateVitalsChart(){
    	this.resetVitalsVariables();
    	if(this.vitalSelected in this.conceptSet && this.conceptSet[this.vitalSelected].length > 0){
    		this.vitalsSelected=this.conceptSet[this.vitalSelected];
    	}
    	else this.vitalsSelected.push(this.vitalSelected);
    	let index=0;
    	for(let i=0; i<this.vitalsSelected.length; i++){
    		this.vitalChartData[i]=[];
	    	this.openmrsRest.list('obs',{ patient: this.config.patientUuid, v: 'full', limit: this.config.maxResults, concept: this.vitalsSelected[i] }).then((resp) => {
	    		const obss = resp.results;
	    		this.vitalChartObs[i]=[];
	            this.vitalChartObs[i] = obss;
	            if (obss.length > 0) {
	                // Set concept to display
	                this.vitalConceptDisplay = obss[0].concept;
	                this.vitalGraphSeries.push(this.vitalConceptDisplay.display);
	                for (let j = 0; j < obss.length; j++) {
	                    let obs = obss[j];
	                    // Show numeric concepts only
	                    if (obs.concept.datatype.display == 'Numeric') {
	                        // Don't add obs older than maxAge
	                        if (angular.isUndefined(this.maxAgeInDays) || (this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= this.maxAgeInDays)) {
	                            if(this.daysAgo == "all" || this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= parseInt(this.daysAgo)){
		                        	// Add obs data for chart display
		                            var date = this.$filter('date')(new Date(obs.obsDatetime), this.config.dateFormat);
		                            if( i === 0){
		                            	this.vitalChartLabels.unshift(date);
		                            }
		                            this.vitalChartData[index].unshift(obs.value);
		                        }
	                        }
	                    }
	                }
	                let yAxisId='y-axis-'.concat(i);
	                this.vitalChartDatasetOverride.push({'yAxisID':yAxisId});
	                this.vitalChartOptions.scales.yAxes.push({ticks:{beginAtZero:true},scaleLabel:{display:true,labelString:this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].shortName + (this.unitIsEmpty(this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].unit) ? ('') : (' ('+this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].unit+')') )},id:yAxisId,type:'linear',display:true,position:(i === 0 ? 'left' : 'right')});
	                if( ('hiNormal' in this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid]) && this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].hiNormal != null){
	                	this.vitalChartOptions.annotation.annotations.push({type:'line',mode:'horizontal',scaleID:(i===0 ? 'y-axis-0' : 'y-axis-1'),borderDash: [2, 2],borderDashOffset: 5,value:this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].hiNormal,borderColor:'red',borderWidth:2,'label':{position:'top',backgroundColor: 'rgba(255,0,0,1)',fontStyle: 'bold',enabled: true, content: this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].shortName+" - high:"+this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].hiNormal} });
	            	}
			    	if( ('lowNormal' in this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid]) && this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].lowNormal != null){
			    		this.vitalChartOptions.annotation.annotations.push({type:'line',mode:'horizontal',scaleID:(i===0 ? 'y-axis-0' : 'y-axis-1'),borderDash: [2, 2],borderDashOffset: 5,value:this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].lowNormal,borderColor:'rgba(51,255,0,0.2)',borderWidth:2,'label':{position:'top',backgroundColor: 'rgba(51,255,0,0.2)',fontStyle: 'bold',enabled: true, content: this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].shortName+" - low:"+this.vitalsMetaDataDict[this.vitalConceptDisplay.uuid].lowNormal}});
		        	}
	        }        
	            index++;
    	})
    	}
        this.vitalChartOptions.scales.xAxes.push({scaleLabel:{display:true, labelString:'Date of Obs'}});
    }
    
    vitalsOnTimePeriodSelected(){
    	this.vitalGraphSeries=[];
    	this.vitalChartLabels=[];
    	this.vitalChartData=[[]];

    	if (this.vitalChartObs.length > 0) {
    		for(let i=0; i<this.vitalChartObs.length; i++){
        		this.vitalChartData[i]=[];
				// Set concept to display
                this.vitalConceptDisplay = this.vitalChartObs[i][0].concept;
                this.vitalGraphSeries.push(this.vitalConceptDisplay.display);
    			if(this.vitalChartObs[i].length > 0){
	                for (let j = 0; j < this.vitalChartObs[i].length; j++) {
	                    let obs = this.vitalChartObs[i][j];
	                    // Show numeric concepts only
	                    if (obs.concept.datatype.display == 'Numeric') {
	                        // Don't add obs older than maxAge
	                        if (angular.isUndefined(this.maxAgeInDays) || (this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= this.maxAgeInDays)) {
	                            if(this.daysAgo == "all" || this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= parseInt(this.daysAgo)){
		                        	// Add obs data for chart display
		                            var date = this.$filter('date')(new Date(obs.obsDatetime), this.config.dateFormat);
		                            if(i === 0){
		                            	this.vitalChartLabels.unshift(date);
		                            }
		                            this.vitalChartData[i].unshift(obs.value);
		                        }
	                        }
	                    }
	                }
    			}
    		}
    	}	
    }
    
    labOnTimePeriodSelected(){
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
                        if(this.daysAgo == "all" || this.widgetsCommons.dateToDaysAgo(obs.obsDatetime) <= parseInt(this.daysAgo)){
                        	// Add obs data for chart display
                            var date = this.$filter('date')(new Date(obs.obsDatetime), this.config.dateFormat);
                            this.labChartLabels.unshift(date);
                            this.labChartData[0].unshift(obs.value);
                        }
                    }
                }
            }
    	}
    }
    
    fetchVitalsConcepts() {
        this.openmrsRest.getFull("concept/" + this.config.vitalsListUuid, {v: 'custom:(uuid,display,names:(display,conceptNameType)'}).then((concept) => {
        	angular.forEach(concept.setMembers, (concept) => {
	        		if(concept.set){
	        				this.conceptSet[concept.uuid]=[];
		        			angular.forEach(concept.setMembers, (c) => {
		        				this.openmrsRest.getFull("concept/" + c.uuid, {v: 'custom:(uuid,display,names:(display,conceptNameType)'}).then((fullConcept) => {
		        	    			if(fullConcept.datatype.display == 'Numeric'){
			        					let cShort = this.getConceptWithShortName(fullConcept);
			        	            	this.vitalsMetaDataDict[cShort.uuid]={'hiNormal':cShort.hiNormal,'lowNormal':cShort.lowNormal,'unit':cShort.units,'shortName':cShort.display};
			        	            	this.conceptSet[concept.uuid].push(fullConcept.uuid);
		        	    			}
		        				});
		        			});
	        				this.vitalsConceptsArray.push([concept.uuid,concept.display]);
	                }
	        		else{
	        			if(concept.datatype.display == 'Numeric'){
			        		this.openmrsRest.getFull("concept/" + concept.uuid, {v: 'custom:(uuid,display,names:(display,conceptNameType)'}).then((fullConcept) => {
			        			let cShort = this.getConceptWithShortName(fullConcept);
				            	this.vitalsMetaDataDict[cShort.uuid]={'hiNormal':cShort.hiNormal,'lowNormal':cShort.lowNormal,'unit':cShort.units,'shortName':cShort.display};
			        		});
                        	this.vitalsConceptsArray.push([concept.uuid,concept.display]);
	        			}
	        		}
            });
        });
    }
    
    fetchLabConcepts() {
        this.openmrsRest.getFull("concept/" + this.config.labResultsUuid, {v: 'custom:(uuid,display,names:(display,conceptNameType)'}).then((concept) => {
        	angular.forEach(concept.setMembers, (concept) => {
        		this.openmrsRest.getFull("concept/" + concept.uuid, {v: 'custom:(uuid,display,names:(display,conceptNameType)'}).then((fullConcept) => {
	                let cShort = this.getConceptWithShortName(fullConcept);
	            	this.labMetaDataDict[cShort.uuid]={'hiNormal':cShort.hiNormal,'lowNormal':cShort.lowNormal,'unit':cShort.units,'shortName':cShort.display};
	                if(concept.datatype.display == 'Numeric'){
	                	this.labConceptsArray.push([cShort.uuid,cShort.display]);
	                }
        		});
            });
        });
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
    
    unitIsEmpty(obj){
    	return !obj;
    }
    
    resetVitalsVariables(){
    	this.vitalsSelected=[];
    	this.vitalChartLabels = [];
    	this.vitalChartData = [[]];
    	this.vitalGraphSeries = [];
    	this.vitalChartDatasetOverride=[];
    	this.vitalChartObs = [[]];
    	this.vitalChartOptions =  {
    		    scales: {
    		      yAxes: [],
    		      xAxes: []
    		    },
    		    annotation: {
    		    	annotations: []
    		    }
    		  };
    	this.showVitalsAnnotationLabel = true;
    }
    
    resetLabResultsVariables(){
    	this.labChartLabels = [];
    	this.labChartData = [[]];
    	this.labChartSeries = [];
    	this.labChartDatasetOverride = [];
    	this.labChartObs = [];
		this.labChartOptions =  {
	 		    scales: {
	 		      yAxes: [],
	 		      xAxes: []
	 		    },
	 		    annotation: {
	 		    	annotations: []
	 		    }
		};
		this.showLabResultsAnnotationLabel = true;
    }
    
    initializeVitalsVariables(){
    	// Vital Chart data
        this.vitalConceptDisplay = {};
        this.vitalSelected;
        this.vitalsSelected=[];
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
        this.showVitalsAnnotationLabel = true;
    }
    
    initializeLabResultsVariables(){
    	// lab Results Chart data
        this.labConceptDisplay={};
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
        this.showLabResultsAnnotationLabel = true;
    }
    
    initializeGeneralVariables(){
    	this.colors = ['#6ABFBF', '#654F1B'],
    	// Max age of obs to display
        this.maxAgeInDays = undefined;
        this.daysAgo="all";        
        // Parse maxAge to day count
        this.maxAgeInDays = this.widgetsCommons.maxAgeToDays(this.config.maxAge);
    	this.conceptSet={};
    }
    
    showHideVitalsAnnotationLabel(){
    	angular.forEach(this.vitalChartOptions.annotation.annotations, (c) => {
    		if(c.label)
    			this.showVitalsAnnotationLabel ? c.label.enabled = true : c.label.enabled = false;
		});
    }
    
    showHideLabResultsAnnotationLabel(){
    	angular.forEach(this.labChartOptions.annotation.annotations, (c) => {
    		if(c.label)
    			this.showLabResultsAnnotationLabel ? c.label.enabled = true : c.label.enabled = false;
		});
    }
}
