var text = {
  allText : [
    `The people gaze at you as a chap that is up to snuff.`,
    `No one seems to notice you.`,
    `You're met as a lost corned.`,
    `Many are kidney to greet you.`,
    `They look at you as a regular brick.`,
  ],
  indText : [
    `The factory is thick with skilly but not a bloke in sight.`,
    `Everyone seems to be unsure of the work conditions.`,
    `The workers are looking around nervously.`,
    `The workers are working in a steady rhythm.`,
  ],
  hintText : [
    `  The households are seemingly uninhabited.`,
    `  Only the tradesmen from the families are left.`,
    `  The people are disturbed by the outbreak.`,
    `  The building is overflowing with families.`,
  ],

  getCare: {
    descriptor : [
      `The dwelling is deficient of light and unclean.  `,
      `The cesspools appear to be unkept.  `,
      `Several familes live, sleep, cook, eat, and wash in a single room across the block.  `,
    ],
    badSymptons : [
      `Numerous peoples here are suffering from diarrhea and cramps.`,
      `The families claim their illness is attributed to the water.`,
      `Several have stools and vomited matters consisting moslty of water.`,
      `They are coughing and sneezing everywhere.`,
      `Many feel unwell.`,
    ],
    falseSymptons : [
      `Numerous peoples are feeling paranoid`,
      `Several have been coughing blood`,
      `Many have been feeling sick`,
      `The families exclaim the plague is from the stench!`,
      `Coughing and wheezing can be heard throughout the complex`,
      `A thick, heavy mist steams from the muddied road.`,
    ],
    noSymptons : [
      `If not for the plague and the smell, the people here are well.`,
      `All appears to not be diseased.`,
      `The outbreak seemingly has never affected this place.`,
      `Nothing feels unpleasant---`,
    ]
  },

  choleraQuizes : [
    [`What is the root cause of Asiatic Cholera?`,
      `infectious odors in the air`, `plague-ridden rats`, `impure water`, 3],
    [`How to prevent the spread of the Cholera?`,
      `abdominal chilling`, `bring all water to a boil`, `isolate the infected into a ward`, 2],
    [`How do you treat Cholera?`,
      `hopes, prayers, and water`, `cholera belt`, `balancing the four humors`, 1],
    [`What year is it?`, `1849`, `1848`, `1853`, 3],
    [`How is Cholera spread?`,
      `Open sewage and cesspools`, `By inhaling putrid matter`, `Swalling the poison from the mouth`, 3],
    [`Cholera is caused by?`,
      `Tiny germs`, `Miasma`, `Poverty`, 1],
    [`The most persistant and deadly charactistic Symptom of Cholera is?`,
      `Persastant Cough`, `High Fever`, `Watery stools`, 3],
    [`With the further advances in the sciences and medicines: will we find a cure?`,
      `Of course!`, `Perhaps Not.`, `Maybe... who know what the future holds---`, 2],
    [`What do the stools of those affected from Cholera resemble?`,
      `Mushed Apples!`, `Rice Water.`, `Fish guts---`, 2], //// TODO: not historical, there are descriptions in writings online
  ],

  medicalQuizes : [
    [`Which offensive trades cause a sense of effluvia which is prejudicial of negative health effects relating to Cholera`,
      `Bone-boiling establishments`, `Knacker's yard`, `None`, 3], //workhouses, slums
    [`Which offensive trades cause a sense of effluvia which is prejudicial of negative health effects relating to Cholera`,
      `Knacker's yard`, `None`, `Workhouses`, 2], //workhouses, slums
    [`Which offensive trades cause a sense of effluvia which is prejudicial of negative health effects relating to Cholera`,
      `None`, `Workhouses`, `Bone-boiling establishments`, 1], //workhouses, slums
    [`Who are you acting on behalf of to give evidence upon the Nuisances Removal and Diseases Prevention Act?`,
      `The Royal Academy`, `The trades people in the south districts`, `Queen Victoria`, 2],
    //John Snow related questions:
    [`John Snow, where do you reside?`, `Sackville St.`, `Savile Row`, `Wallow S.`, 1],


    //dsecription talking about miasma causing cholera
    [`What is the the more dangerous medicine to administer for anesthesia?`,
      `Chloroform`, `Ether`, `Factitious Airs`, 1],
    [`What medicine is best administered for anesthesia?`,
      `Chloroform and Ether`, `Alcohol and Ether`, `Factitious Airs`, 1],
    [`How to best administer ether or chloroform for anesthesia?`,
      `Pour onto a table cloth and hold to face`, `Inhale through an apparatus`, `Swallow directly`, 2],
  ],
};
export default text;

//http://www.ph.ucla.edu/epi/snow/snowbook.html
let quotes = [
  `A consideration of the pathology of cholera is capable of indicating to us the manner in which the disease is communicated. If it were ushered in by fever, or any other general constitutional disorder, then we should be furnished with no clue to the way in which the morbid poison enters the system; whether, for instance, by the alimentary canal, by the lungs, or in some other manner, but should be left to determine this point by circumstances unconnected with the pathology of the disease.  But from all that I have been able to learn of cholera, both from my own observations and the descriptions of others, I conclude that cholera invariably commences with the affection of the alimentary canal. `
];

let choleraSymptons = [
  `It appears a mother washed her daughter's linen and her family fell ill with the malady.`,
  `A number of households have members sweating profoundly.`,
  `A lady who had had premonitory symptoms for three or four days died fatally in fourteen hours.`,
];
let severeCholeraSymptons = [
  `Numberous peoples here are suffering from diarrhea and cramps.`,
  `Many of the patients attributed their illness to the water.`,
  `Several children were placed two or three in a bed, and vomited over each other.`,
  `Several have stools and vomited matters consisting moslty of water.`,
];
