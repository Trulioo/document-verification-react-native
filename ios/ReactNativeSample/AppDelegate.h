#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>
{
  NSDictionary *options;
  UIViewController *viewController;
}

@property (nonatomic, strong) UIWindow *window;
@end

