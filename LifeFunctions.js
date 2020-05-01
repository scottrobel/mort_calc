function getData(ajaxurl) { 
    return $.ajax({
      url: ajaxurl,
      type: 'GET',
      async: false
    }).responseText;
  };
function MortalityHash(){
    return JSON.parse(getData('mortality_data.json'));
}
  
//l(x) column
function ageToPeopleAlivePerMillion(ageMortalityPairs){
    ageToPeopleAlive = {};
    peopleAlive = 1000000; 
    ageMortalityPairs.forEach(function(mortality, age){
        survivalRate = 1 - mortality;
        peopleAliveAfterInterval = peopleAlive * survivalRate;
        ageToPeopleAlive[age+1] = peopleAliveAfterInterval;
        peopleAlive = peopleAliveAfterInterval;
    })
    return ageToPeopleAlive;
}
//L(x) column
//(l(x) + l(x+1)) * 0.5
function personYearsInYear(startPopulation, endPopulation)
{
    return (startPopulation + endPopulation) * 0.5
}
//L(x) column
function getAgePersonYearsPairs(ageMortalityPairs)
{
    agePersonYearsPairs = {}
    agePeopleAlivePairs = ageToPeopleAlivePerMillion(ageMortalityPairs);
    for(let age = 0; !!ageMortalityPairs[age]; age++)
    {
        startPopulation = agePeopleAlivePairs[age]
        endPopulation = agePeopleAlivePairs[age+1]
        agePersonYearsPairs[age] = personYearsInYear(startPopulation, endPopulation)
    }
    return agePersonYearsPairs
}
//T(X) column
function totalPersonYearsAfter(ageInput , ageMortalityPairs)
{
    totalPersonYears = 0
    agePersonYearsPairs = getAgePersonYearsPairs(ageMortalityPairs)
    for(let age = ageInput; !!ageMortalityPairs[age]; age++)
    {
        personYears = agePersonYearsPairs[age]
        totalPersonYears += personYears;
    }
    return totalPersonYears;
}
//e(x) column
//T(50)/l(50)
function ageToExpectedLifeSpan(ageMortalityPairs)
{
    ageToPeopleAlive = ageToPeopleAlivePerMillion(ageMortalityPairs)
    ageLifeSpans = {}
    for(let age = 1; age < 110; age++)
    {
        ageLifeSpans[age] = totalPersonYearsAfter(age, ageMortalityPairs) / ageToPeopleAlive[age]
    }
    return ageLifeSpans;
}
function getMortalityPairs(countryCode, gender){
    return MortalityHash()[countryCode][gender];
}
function getLifeSpan(countryCode, gender, age){
    mortPairs = getMortalityPairs(countryCode, gender)
    lifeSpanPairs = ageToExpectedLifeSpan(mortPairs)
    return lifeSpanPairs[age];
}
function displayLifeSpan()
{
    yearsHeader = document.querySelector('#years-left');
    ageField = document.querySelector("#age-field")
    genderField = document.querySelector('#gender')
    countryCodeField = document.querySelector('#country-codes')
    gender = genderField.value
    age = ageField.value;
    country = countryCodeField.value
    lifeSpan = getLifeSpan(country, gender, age)
    yearsHeader.innerText = `${Math.round(lifeSpan)} Years Remaining`
}