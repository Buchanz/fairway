import type {ImageSourcePropType} from 'react-native';
// Development references from official course pages. Replace with licensed,
// hosted assets before store/public release; no generic photo impersonates a course.
export const coursePhotos:Record<string,{image:ImageSourcePropType;source:string;contentAspectRatio?:number}>={
 'olympic-view':{image:require('../../assets/course-photos/olympic-view.jpg'),source:'https://olympicviewgolf.com/golf_course'},
 'highland-pacific':{image:require('../../assets/course-photos/highland-pacific.jpg'),source:'https://www.highlandpacificgolf.com/'},
 'duncan-meadows':{image:require('../../assets/course-photos/duncan-meadows.jpg'),source:'https://www.duncanmeadows.com/'},
 'cordova-bay':{image:require('../../assets/course-photos/cordova-bay.jpg'),source:'https://www.cordovabaygolf.com/golf/'},
 'cordova-ridge':{image:require('../../assets/course-photos/cordova-ridge.jpg'),source:'https://www.cordovabaygolf.com/golf/'},
 'bear-mountain':{image:require('../../assets/course-photos/bear-mountain.jpg'),source:'https://bearmountain.ca/recreation/golf/'},
 'bear-valley':{image:require('../../assets/course-photos/bear-valley.jpg'),source:'https://bearmountain.ca/recreation/golf/'},
 'cedar-hill':{contentAspectRatio:4.54,image:require('../../assets/course-photos/cedar-hill.jpg'),source:'https://www.saanich.ca/en/main/parks-recreation-community/cedar-hill-golf-course.html'},
 'mount-douglas':{image:require('../../assets/course-photos/mount-douglas.jpg'),source:'https://mountdouggolf.ca/'},
 'ardmore':{image:require('../../assets/course-photos/ardmore.jpg'),source:'https://www.ardmoregolfcourse.com/'},
 'royalwood':{image:require('../../assets/course-photos/royalwood.jpg'),source:'https://royalwoodgolf.com/photo-gallery/'},
 'langley-golf-centre':{image:require('../../assets/course-photos/langley-golf-centre.jpg'),source:'https://www.langleygolfcentre.com/golf-rates-and-online-bookings'},
 'poppy-estate':{contentAspectRatio:2.11,image:require('../../assets/course-photos/poppy-estate.jpg'),source:'https://www.poppygolf.ca/'},
 'belmont':{contentAspectRatio:1.67,image:require('../../assets/course-photos/belmont.jpg'),source:'https://wcgg.ca/Belmont/'},
 'delta-golf':{contentAspectRatio:2.07,image:require('../../assets/course-photos/delta-golf.jpg'),source:'https://deltagolfcourse.com/our-facility/'},
 'sandpiper':{contentAspectRatio:.8,image:require('../../assets/course-photos/sandpiper.jpg'),source:'https://sandpiperresort.ca/bc-golf-trip/'},
};
