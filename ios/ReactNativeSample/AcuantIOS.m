//
//  AcuantIOS.m
//  ReactNativeSample
//
//  Created by Callen Egan on 2021-01-18.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"


@interface RCT_EXTERN_MODULE(AcuantIOS, NSObject)
RCT_EXTERN_METHOD(InitSDK: (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(StartDocumentCapture: (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(SetCropEnabled: (BOOL)cropEnabled)
RCT_EXTERN_METHOD(SetAutoCaptureEnabled: (BOOL)autoCaptureEnabled)
RCT_EXTERN_METHOD(StartBarcodeCapture: (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(StartPassportCapture: (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(StartSelfieCapture: (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end
