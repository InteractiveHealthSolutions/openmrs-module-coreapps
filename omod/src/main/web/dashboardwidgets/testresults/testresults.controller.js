export default class TestResultsController {
    constructor($filter, openmrsRest, widgetsCommons) {
        'ngInject';

        Object.assign(this, { $filter, openmrsRest, widgetsCommons });
    }

    $onInit() {
        this.order = 'desc';
        this.concepts = [];
        this.encounters = [];
        this.obss= [] ;
      
        this.masterDataList =  [] ;
        this.masterTargetDataList=[];
    //    this.masterData = { "conceptName" : ""  , "dataList" :  []   }  ;
     //   this.dataList = [] ;
     //   this.data = {conceptuuId:"",  conceptName:"",  obsValue:"" ,  createdDateObs : ""    };
        	
              
        this.openmrsRest.setBaseAppPath("/coreapps");

      
        this.fetchEncounters();
        
        
        this.fetchConcepts() ;     
        this.fetchTarget();
        this.fetchObs();
       
    }

    
     
    fetchConcepts() {
    	
    	  console.log("fetchConcepts start");
    	
        this.concepts = this.config.concepts.split(",");
        console.log("fetchConcepts Concepts  "+ JSON.stringify(  this.concepts));
        
        for(let i = 0; i < this.concepts.length; i++) {
            this.openmrsRest.getFull("concept/" + this.concepts[i], {v: 'custom:(uuid,display,names:(display,conceptNameType)'}).then((concept) => {
               // let index = this.concepts.indexOf(concept.uuid);
               // this.concepts[index] = this.getConceptWithShortName(concept);
              console.log("fetchConcepts concept="+JSON.stringify(concept)) ;
              
              console.log("fetchConcepts concept.name.display="+JSON.stringify(concept.name.display)) ;
             var  masterData = { "conceptName" : ""  , "conceptShortName":"" , "dataList" :  []   }  ;
              
             var conceptShortName="";
             for(var j=0 ;  j<concept.names.length  ; j++)
             {
             	if(concept.names[j].conceptNameType=="SHORT")
             		{
             		conceptShortName=concept.names[j].name;
             		break;
             		}
             }
             
             
             if(conceptShortName.trim()=="")
             {
            	 conceptShortName =  concept.name.display
             }
             
             
              masterData.conceptName= concept.name.display ;
              masterData.conceptShortName= conceptShortName ;
              masterData.dataList =[] ;
              
                  
              console.log("fetchConcepts masterDataList Start");
              this.masterDataList.push(  masterData );
              
          
              
              console.log("fetchConcepts number="+i+"=concept adding masterDataList="+  JSON.stringify(this.masterDataList)  );
              
              
            });
        }
        
        console.log("fetchConcepts end");
    }

    
    
    
    fetchTarget() {
    	
    	console.log("fetchTarget start ");
    
    	 let concepts = this.config.targetConcepts.split(",");
    
    console.log("fetchTarget Concepts  "+ JSON.stringify(  concepts));
    
    for (let i = 0; i < concepts.length; i++) {
        let concept = concepts[i];
       
        this.openmrsRest.list('obs', {
            patient: this.config.patientUuid,
            v: 'full',
            concept: concept,
            limit : 1
        }).then((resp) => {
        	
        	console.log("fetchTarget responseFromObs="+JSON.stringify(resp));
        	if(resp.results!=null)
        		{
	        		var dataList = [];
	        		for(let j=0 ; j<resp.results.length  ; j++ )
	        		{
	        			var  data = {conceptuuId:"",  conceptName:"",  obsValue:"" ,  createdDateObs : ""    };
	        			
	        				
	        			console.log(j+"fetchTarget  resp.results[j].concept.uuid="+ resp.results[j].concept.uuid  );
	        			console.log(j+"fetchTarget  resp.results[j].concept.display="+ resp.results[j].concept.display  );
	        			console.log(j+"fetchTarget  resp.results[j].concept.value="+  parseFloat( resp.results[j].value ) );
	        			console.log(j+"fetchTarget  resp.results[j].concept.obsDatetime="+  resp.results[j].concept.obsDatetime  );
	        		
	        			
	        			data.conceptuuId = resp.results[j].concept.uuid ;
	        			data.conceptName = resp.results[j].concept.name.display ;
	        			data.obsValue = parseFloat( resp.results[j].value.toFixed(2) ) ; 
	        			data.target = "target";
	        		
	        			console.log("fetchTarget data="+ JSON.stringify(data) );
	        			
	        			dataList.push(data) ;
	        			
	        		}
        		
	        		console.log("fetchTarget dataList="+ JSON.stringify(dataList) );
        		 
	        		
	        		
	        		if(dataList.length > 0 )
        			{ 
        			
	        			var masterDataListIndex=0 ;
	        			
	        				for(let k=0  ;  k < this.masterDataList.length ; k++)
	        				{
	        					console.log(k+"fetchTarget checking="+this.masterDataList[k].conceptName+"  "+dataList[0].conceptName) ;
	        					console.log(k+"fetchTarget checking dataList[0].conceptName.toLowerCase()="+dataList[0].conceptName.toLowerCase()+"  this.masterDataList[k].conceptName.toLowerCase()="+this.masterDataList[k].conceptName.toLowerCase()) ;
	        					
	        					if( dataList[0].conceptName.toLowerCase().includes(this.masterDataList[k].conceptName.toLowerCase())  ||  
	        							dataList[0].conceptName.toLowerCase().includes(this.masterDataList[k].conceptShortName.toLowerCase()))
	        					{
	        						console.log("fetchTarget condition true");
	        						
	        						masterDataListIndex = k ;
	        						console.log("fetchTarget masterDataListIndex="+ k );
	        							break ;		
	        					}
	        				}
	        			
	        				/*
	        				
	        				if(masterDataListIndex==0 && dataList[0].conceptName=='PEFR target'  )
	        					{
	        					  
		        					for (var z=0 ; z<this.masterDataList.length ; z++)
		        					
		        					 if("Peak Expiratory Flow rate".toLowerCase()== this.masterDataList[z].conceptName.toLowerCase() )
		        					{
		        						 
		        						 console.log("fetchTarget condition true Peak Expiratory Flow rate");
		        						 masterDataListIndex = z ;	 
		        						 break;
		        						 
		        					}
		        					
	        					
	        					}*/
	        				
	        				
	        				
	        			console.log(i+"fetchTarget dataList="+JSON.stringify(dataList));
	        			this.masterDataList[masterDataListIndex].dataList =   dataList ;	 	
	        			
        			
        			} 
	        		
	        		
	        		

	        			
	        			console.log("fetchTarget masterTargetDataList="+ JSON.stringify(this.masterDataList) );
        		}
        	
        	
        	
        });
     
    	}
    
	console.log("fetchTarget end ");
    }
        
        
    
    
    
    
    
    
    fetchObs()
    {
     console.log("fetchObs start");
    	
     let concepts = this.config.concepts.split(",");
      
        console.log("fetchObs Concepts  "+ JSON.stringify(  concepts));
        
        for (let i = 0; i < concepts.length; i++) {
            let concept = concepts[i];
           
            this.openmrsRest.list('obs', {
                patient: this.config.patientUuid,
                v: 'full',
                concept: concept,
                limit : 3
            }).then((resp) => {
            	
            	console.log("fetchObs responseFromObs="+JSON.stringify(resp));
            	if(resp.results!=null)
            		{
    	        		var dataList = [];
    	        		for(let j=0 ; j<resp.results.length  ; j++ )
    	        		{
    	        			var  data = {conceptuuId:"",  conceptName:"",  obsValue:"" ,  createdDateObs : ""    };
    	        				
    	        			console.log(j+"fetchObs  resp.results[j].concept.uuid="+ resp.results[j].concept.uuid  );
    	        			console.log(j+"fetchObs  resp.results[j].concept.display="+ resp.results[j].concept.display  );
    	        			console.log(j+"fetchObs  resp.results[j].concept.value="+  parseFloat( resp.results[j].value ) );
    	        			console.log(j+"fetchObs  resp.results[j].concept.obsDatetime="+ resp.results[j].concept.obsDatetime  );
    	        			
    	        			data.conceptuuId = resp.results[j].concept.uuid ;
    	        			data.conceptName = resp.results[j].concept.name.display ;
    	        			data.obsValue =   parseFloat(   resp.results[j].value.toFixed(2) ) ;
    	        			
    	        			data.createdDateObs = this.formatDate( resp.results[j].obsDatetime );
    	        			data.target = "";
    	        		
    	        			console.log("fetchObs data="+ JSON.stringify(data) );
    	        			
    	        			dataList.push(data) ;
    	        			
    	        		}
            		
    	        		console.log(i+"fetchObs dataList="+ JSON.stringify(this.dataList) );
            		 
    	        	
    	        		if(dataList.length > 0 )
    	        			{ 
    	        			
	    	        			var masterDataListIndex=0 ;
	    	        			
	    	        				for(let k=0  ;  i < this.masterDataList.length ; k++)
	    	        				{
	    	        					console.log("fetchObs checking="+this.masterDataList[k].conceptName+"=="+dataList[0].conceptName) ;
	    	        					if(this.masterDataList[k].conceptName==dataList[0].conceptName)
	    	        					{
	    	        						console.log("fetchObs condition true");
	    	        						
	    	        						masterDataListIndex = k ;
	    	        						console.log("fetchObs masterDataListIndex="+ k );
	    	        							break ;		
	    	        					}
	    	        				}
	    	        			
	    	        				
	    	        			console.log(i+"fetchObs dataList="+JSON.stringify(dataList));
	    	        		
	    	        			
	    	        			for(var q=0  ; q<dataList.length  ; q++ )
	    	        			{
	    	        				this.masterDataList[masterDataListIndex].dataList.push(dataList[q]) ;	 	
	    	        			}
    	        			
    	        			} 
            		
    	        			console.log("fetchObs masterDataList="+ JSON.stringify(this.masterDataList) );
            		}
            	
            });
         
        	}
        
    	
        console.log("fetchObs end");
    }
    
    
          
     formatDate(pDate) {
    	 
    	 console.log("formatDate start ");
    	 console.log("formatDate start pDate="+pDate);
    	 
    	 var date= new Date(pDate);
    	 
    	  var monthNames = [
    	    "JAN", "FEB", "MAR",
    	    "APR", "MAY", "JUN", "JUL",
    	    "AUG", "SEP", "OCT",
    	    "NOV", "DEC"
    	  ];

    	  var day = date.getDate();
    	  var monthIndex = date.getMonth();
    	  

    	  console.log("formatDate end day + ' ' + monthNames[monthIndex]="+ day + ' ' + monthNames[monthIndex]);
    	  return day + ' ' + monthNames[monthIndex] ;
    	}
    
    
    fetchEncounters() {
        this.openmrsRest.get("encounter", {
            patient: this.config.patientUuid,
            v: 'custom:(uuid,encounterDatetime,obs:(uuid,value,concept:(uuid,datatype),groupMembers)',
            limit: this.getMaxRecords(),
            fromdate: this.widgetsCommons.maxAgeToDate(this.config.maxAge),
            order: this.order
        }).then((response) => {
            this.getEncounters(response.results);
        });
    }

    getMaxRecords() {
        if(this.config.maxRecords == '' || angular.isUndefined(this.config.maxRecords)){
            return 4;
        } else {
            return this.config.maxRecords;
        }
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

    getEncounters(encounters) {
        angular.forEach(encounters, (encounter) => {
            let enc = {
                encounterDatetime: encounter.encounterDatetime,
                obs: []
            };
            var nullRow = true;
            angular.forEach(this.getConfigConceptsAsArray(this.config.concepts), (concept) => {
                let obsValue = this.getObservationForConcept(encounter.obs, concept);
                enc.obs.push(obsValue);
                if(obsValue.value !== '-') {
                    nullRow = false;
                }
            });

            if(!nullRow) {
                this.encounters.push(enc);
            }
        });
    }

    getObservationForConcept(observations, conceptUuid) {
        for(var i = 0; i < observations.length; i++){
            var obs = observations[i];
            if (obs.groupMembers != null) {
                if (obs.groupMembers.length !== 0) {
                    //it is a group obs
                    for (var j = 0; j < obs.groupMembers.length; j++) {
                        var groupMember = obs.groupMembers[j];
                        if (groupMember.concept.uuid === conceptUuid) {
                            obs = groupMember;
                            break;
                        }
                    }
                }
            }

            if (obs.value != null && obs.concept.uuid === conceptUuid) {
                if (angular.isDefined(obs.value.display)) {
                    //If value is a concept
                    obs.value = obs.value.display;
                }
                else if (['8d4a505e-c2cc-11de-8d13-0010c6dffd0f',
                        '8d4a591e-c2cc-11de-8d13-0010c6dffd0f',
                        '8d4a5af4-c2cc-11de-8d13-0010c6dffd0f'].indexOf(obs.concept.datatype.uuid) > -1) {
                    //If value is date, time or datetime
                    var date = this.$filter('date')(new Date(obs.value), this.config.dateFormat);
                    obs.value = date;
                }

                return obs;
            }
        }
        return {value: '-'};
    }
}
