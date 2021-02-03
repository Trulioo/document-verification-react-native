package com.reactnativesample

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import android.util.Log
import com.acuant.acuantcamera.camera.AcuantCameraActivity
import com.acuant.acuantcamera.camera.AcuantCameraOptions
import com.acuant.acuantcamera.constant.ACUANT_EXTRA_CAMERA_OPTIONS
import com.acuant.acuantcamera.constant.ACUANT_EXTRA_IMAGE_URL
import com.acuant.acuantcommon.exception.AcuantException
import com.acuant.acuantcommon.initializer.AcuantInitializer
import com.acuant.acuantcommon.initializer.IAcuantPackageCallback
import com.acuant.acuantcommon.model.Error
import com.acuant.acuantfacecapture.FaceCaptureActivity
import com.acuant.acuantimagepreparation.AcuantImagePreparation
import com.acuant.acuantimagepreparation.background.EvaluateImageListener
import com.acuant.acuantimagepreparation.initializer.ImageProcessorInitializer
import com.acuant.acuantimagepreparation.model.AcuantImage
import com.acuant.acuantimagepreparation.model.CroppingData
import com.facebook.react.bridge.*
import com.google.gson.Gson
import java.io.BufferedInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream

class CaptureResult(
        val image: String,
        val glare: Int? = null,
        val sharpness: Int? = null,
        val dpi: Int? = null
)

class AcuantImageCapture(reactContextInput: ReactApplicationContext) : ReactContextBaseJavaModule() {
    private val cameraRequestCode = 1
    private val selfieRequestCode = 2
    private var capturePromise: Promise? = null
    private var initPromise: Promise? = null
    private var reactContext: ReactApplicationContext = reactContextInput

    private var shouldCrop = true
    private var shouldUseAutoCapture = true

    private fun readFromFile(fileUri: String?): ByteArray{
        val file = File(fileUri)
        val bytes = ByteArray(file.length().toInt())
        try {
            val buf = BufferedInputStream(FileInputStream(file))
            buf.read(bytes, 0, bytes.size)
            buf.close()
        } catch (e: Exception){
            e.printStackTrace()
        }
        file.delete()
        return bytes
    }

    fun bitmapTobase64(image: Bitmap): String {
        val byteArrayStream = ByteArrayOutputStream()
        val quality = 100
        image.compress(Bitmap.CompressFormat.JPEG, quality, byteArrayStream)
        val byteArray: ByteArray = byteArrayStream.toByteArray()
        val base64Image = Base64.encodeToString(byteArray, Base64.DEFAULT)
        return "data:image/jpeg;base64,$base64Image"
    }

    private val mActivityListener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == cameraRequestCode) {
                if (resultCode == AcuantCameraActivity.RESULT_SUCCESS_CODE) {
                    val bytes = readFromFile(data?.getStringExtra(ACUANT_EXTRA_IMAGE_URL))
                    if(shouldCrop) {
                        AcuantImagePreparation.evaluateImage(reactContext, CroppingData(BitmapFactory.decodeByteArray(bytes, 0, bytes.size)), object : EvaluateImageListener {
                            override fun onSuccess(image: AcuantImage) {
                                val base64Image = bitmapTobase64(image.image)
                                val resultObject = CaptureResult(base64Image, image.glare, image.sharpness, image.dpi)
                                val jsonString: String = Gson().toJson(resultObject)
                                capturePromise?.resolve(jsonString)
                            }

                            override fun onError(error: Error) {
                                capturePromise?.reject("FAIL", "Unable to crop image")
                                capturePromise = null
                            }
                        })
                    } else {
                        val base64: String = Base64.encodeToString(bytes, Base64.DEFAULT)
                        val resultObject = CaptureResult("data:image/jpeg;base64,$base64")
                        val jsonString: String = Gson().toJson(resultObject)
                        capturePromise?.resolve(jsonString)
                        capturePromise = null
                    }
                }
                else {
                    capturePromise?.reject("FAIL", "Unable to capture image")
                    capturePromise = null
                }
            } else if (requestCode == selfieRequestCode) {
                if (resultCode == FaceCaptureActivity.RESPONSE_SUCCESS_CODE) {
                    val bitmap = BitmapFactory.decodeFile(data?.getStringExtra(FaceCaptureActivity.OUTPUT_URL))
                    val base64 = bitmapTobase64(bitmap)
                    val resultObject = CaptureResult(base64)
                    val jsonString: String = Gson().toJson(resultObject)
                    capturePromise?.resolve(jsonString)
                } else {
                    capturePromise?.reject("FAIL", "Unable to capture image")
                }
                capturePromise = null
            }
        }
    }

    init {
        reactContext = reactContextInput
        reactContext.addActivityEventListener(mActivityListener)
    }

    @ReactMethod
    fun InitSDK(promise: Promise?) {
        initPromise = promise
        try{
            AcuantInitializer.initialize("acuant.config.xml", reactContext, listOf(ImageProcessorInitializer()),
                    object : IAcuantPackageCallback {
                        override fun onInitializeSuccess() {
                            initPromise?.resolve("SUCCESS")
                        }

                        override fun onInitializeFailed(error: List<Error>) {
                            initPromise?.reject("FAIL", "Fail to init Capture sdk, please check credentials")
                        }

                    })
        }
        catch (e: AcuantException){
            Log.e("Acuant Error", e.toString())
            initPromise?.reject("ERROR", "Fail to init Capture sdk")
        }
    }

    override fun getName(): String {
        return "AcuantCaptureAndroid"
    }

    private fun captureDocument(promise: Promise?) {
        capturePromise = promise
        val cameraIntent = Intent(
                reactContext,
                AcuantCameraActivity::class.java
        )
        cameraIntent.putExtra(ACUANT_EXTRA_CAMERA_OPTIONS,
                AcuantCameraOptions
                        .DocumentCameraOptionsBuilder()
                        .setAutoCapture(shouldUseAutoCapture)
                        .build()
        )
        reactContext.currentActivity?.startActivityForResult(cameraIntent, cameraRequestCode)
    }

    @ReactMethod
    fun StartDocumentCapture(promise: Promise?) {
        captureDocument(promise)
    }

    @ReactMethod
    fun StartPassportCapture(promise: Promise?) {
        captureDocument(promise)
    }

    @ReactMethod
    fun StartBarcodeCapture(promise: Promise?) {
        captureDocument(promise)
    }

    @ReactMethod
    fun StartSelfieCapture(promise: Promise?) {
        capturePromise = promise
        val cameraIntent = Intent(
                reactContext,
                FaceCaptureActivity::class.java
        )
        reactContext.currentActivity?.startActivityForResult(cameraIntent, selfieRequestCode)
    }

    @ReactMethod
    fun SetCropEnabled(enableCrop: Boolean) {
        shouldCrop = enableCrop
    }

    @ReactMethod
    fun SetAutoCaptureEnabled(enableAuto: Boolean) {
        shouldUseAutoCapture = enableAuto
    }
}
