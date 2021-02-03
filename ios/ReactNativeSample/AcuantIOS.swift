//
//  AcuantIOS.swift
//  ReactNativeSample
//
//  Created by Callen Egan on 2021-01-18.
//

import Foundation
import UIKit
import AcuantImagePreparation
import AcuantCamera
import AcuantCommon
import AcuantDocumentProcessing
import AcuantFaceMatch
import AcuantHGLiveness
import AcuantIPLiveness
import AVFoundation

@objc(AcuantIOS)
class AcuantIOS: NSObject, CameraCaptureDelegate, InitializationDelegate, AcuantHGLiveFaceCaptureDelegate, AcuantHGLivenessDelegate {
  
  
  private let rootViewController = UIApplication.shared.delegate?.window??.rootViewController
  private let navigationController = UIApplication.shared.delegate?.window??.rootViewController as? UINavigationController
  private var jsResolve: RCTPromiseResolveBlock!
  private var jsReject: RCTPromiseRejectBlock!
  
  public var initialized : Bool = false
  public var shouldAutoCrop : Bool = true
  public var shouldAutoCapture : Bool = true
  
  struct ImageObj: Codable {
    var image: String
    var sharpness: Int?
    var glare: Int?
    var dpi: Int?
  }
  
  private func resetData(){
    jsResolve = nil
    jsReject = nil
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
      return true
  }
  
  func initializationFinished(error: AcuantError?) {
    
  }
  
  func setCapturedImage(image: Image, barcodeString: String?) {
    if (image.image != nil) {
      if (self.shouldAutoCrop) {
        AcuantImagePreparation.evaluateImage(image: image.image!) {
            result, error in
          if (result != nil) {
            self.jsResolve(self.encodeData(image: result!.image, details: result))
          } else {
            self.jsReject("FAIL", "ERROR, COULD NOT CROP IMAGE", nil)
          }
        }
      } else {
        self.jsResolve(self.encodeData(image: image.image!, details: nil))
      }
    } else {
      jsReject("FAIL", "ERROR, NO IMAGE CAPTURED", nil)
    }
  }
  
  func convertImageToBase64String (img: UIImage) -> String {
    return img.jpegData(compressionQuality: 1)?.base64EncodedString() ?? ""
  }
  
  func encodeData(image: UIImage, details: AcuantImage?) -> String {
    let jsonEncoder = JSONEncoder()
    var returnObj = ImageObj(image:"",sharpness:nil,glare:nil,dpi:nil)
    returnObj.image = "data:image/jpeg;base64," + self.convertImageToBase64String(img: image)
    if (details != nil) {
      returnObj.sharpness = details!.sharpness
      returnObj.glare = details!.glare
      returnObj.dpi = details!.dpi
    }
    let jsonData = try! jsonEncoder.encode(returnObj)
    return String(data: jsonData, encoding: .utf8)!
  }
  
  func cropImage(image:UIImage)->Image?{
    let croppingData  = CroppingData()
    croppingData.image = image
    
    let croppedImage = AcuantImagePreparation.crop(data: croppingData)
    return croppedImage
  }
  
  func liveFaceDetailsCaptured(liveFaceDetails: LiveFaceDetails?, faceType: AcuantFaceType) {

  }
  
  func liveFaceCaptured(image: UIImage?) {
    if (image != nil) {
      jsResolve(self.encodeData(image: image!, details: nil))
    } else {
      jsReject("FAIL", "ERROR, NO IMAGE CAPTURED", nil)
    }
  }
  
  private func ShareCapture(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
    resetData()
    jsResolve = resolve
    jsReject = reject
    
    // handler in .requestAccess is needed to process user's answer to our request
    AVCaptureDevice.requestAccess(for: .video) { [weak self] success in
        if success {
            DispatchQueue.main.async {
              let options = AcuantCameraOptions(digitsToShow: 2, autoCapture: self!.shouldAutoCapture, hideNavigationBar: true)
                let documentCameraController = DocumentCameraController.getCameraController(delegate:self!, cameraOptions: options)
                self!.navigationController?.pushViewController(documentCameraController, animated: false)
            }
        } else {
          self!.jsReject("FAIL", "CAMERA ACCESS DENIED", nil)
        }
    }
  }
  
  @objc
  func InitSDK(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
    if (self.initialized) {
      resolve("SUCCESS")
    } else {
      resetData()
      jsResolve = resolve
      jsReject = reject
      
      let packages = [AcuantImagePreparationPackage()]
      let initalizer: IAcuantInitializer = AcuantInitializer()
       let _ = initalizer.initialize(packages: packages){ [weak self]
         error in
           if error != nil {
            self!.jsReject("FAIL", "FAILURE TO INITIALIZE PACKAGES", nil)
           }
           else{
            self!.initialized = true
            self!.jsResolve("SUCCESS")
           }
       }
    }
  }
  
  @objc
  func StartDocumentCapture(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock){
    self.ShareCapture(resolve, rejecter: reject)
  }
  
  @objc
  func SetCropEnabled(_ cropEnabled: Bool) {
    self.shouldAutoCrop = cropEnabled
  }
  
  @objc
  func SetAutoCaptureEnabled(_ autoCaptureEnabled: Bool) {
    self.shouldAutoCapture = autoCaptureEnabled
  }
  
  @objc
  func StartBarcodeCapture(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock){
    self.ShareCapture(resolve, rejecter: reject)
  }
  
  @objc
  func StartPassportCapture(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock){
    self.ShareCapture(resolve, rejecter: reject)
  }
  
  @objc
  func StartSelfieCapture(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock){
    resetData()
    jsResolve = resolve
    jsReject = reject
    
    AVCaptureDevice.requestAccess(for: .video) { [weak self] success in
      if success {
        DispatchQueue.main.async {
          let controller = FaceLivenessCameraController.getFaceLivenessCameraController(delegate: self!)
          self!.navigationController?.pushViewController(controller, animated: false)
        }
      } else {
        self!.jsReject("FAIL", "CAMERA ACCESS DENIED", nil)
      }
    }
  }
  
}
