import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/router';
import {AppProvider, Frame, Navigation, Page, TopBar} from '@shopify/polaris';
import {HomeMajor, OrdersMajor} from '@shopify/polaris-icons';
import enTranslations from '@shopify/polaris/locales/en.json';
import GrowFrame, {updateGrowFrameHeight} from '../src/components/GrowFrame';
import {fromFrame, Context} from '@shopify/app-bridge';
import {HostProvider, useHostContext} from '@shopify/app-bridge-host';
import AppBridgeLoading from '@shopify/app-bridge-host/components/Loading';
import AppBridgeModal from '@shopify/app-bridge-host/components/Modal';
import AppBridgeContextualSaveBar from '@shopify/app-bridge-host/components/ContextualSaveBar';
import {Group} from '@shopify/app-bridge/actions';
import {setFeaturesAvailable} from '@shopify/app-bridge-host/store';

// Force the CommonJS bundle (node_modules/@shopify/react-i18n/build/cjs) so it
// matches the bundle @shopify/app-bridge-host uses. Otherwise, the Context
// objects are different and we get errors.
const {I18nContext, I18nManager} = require('@shopify/react-i18n');

const DEFAULT_LOCALE = 'en';
const I18N_MANAGER = new I18nManager({locale: DEFAULT_LOCALE, country: 'US'});

const config = {
  apiKey: 'PlayroomAppFakeID',
  appId: 'app id from GraphQL',
  handle: 'my-app-handle',
  shopId: 'shop id from GraphQL',
  url: 'http://localhost:3000/',
  name: 'app name',
  forceRedirect: false,
};

const initialState = {
  // TODO: Confirm that enabling all these permissions doesn't have adverse
  // effects within the host. In particular: Does enabling WebVitals trigger any
  // network data, etc?
  features: setFeaturesAvailable(
    Group.AuthCode,
    Group.Button,
    Group.ButtonGroup,
    Group.Cart,
    Group.Client,
    Group.ContextualSaveBar,
    Group.Error,
    Group.Features,
    Group.FeedbackModal,
    Group.Fullscreen,
    Group.LeaveConfirmation,
    Group.Link,
    Group.Loading,
    Group.Menu,
    Group.Modal,
    Group.Navigation,
    Group.Performance,
    Group.Pos,
    Group.Print,
    Group.ResourcePicker,
    Group.Scanner,
    Group.SessionToken,
    Group.Share,
    Group.TitleBar,
    Group.Toast,
    Group.MarketingExternalActivityTopBar,
    Group.WebVitals,
  ),
};

// NOTE: Attempted to replace this with an AppBridge <MainFrame> component, but
// ran into some issues:
// 1. <MainFrame> strips the `.search` from the frame URL which our "app"
//    (Playroom preview) requires.
//    Possible fix: patch-package it back in.
// 2. The callback for `onLoad` of a <MainFrame> may trigger too early, so we
//    need a better place to run updateGrowFrameHeight() method so the docs site
//    knows the height to allocate to rendering the App Bridge + iframe.
// 3. The window targeted with `.addEventListener` is incorrect due to the way
//    `.postMessage` is called within app-bridge, combined with this being an
//    iframe within an iframe (see inline comments below for more).
const TheApp = () => {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const hostContext = useHostContext();

  // Forward the query string down to the "app" (Playroom preview): it contains
  // the code to render
  const router = useRouter();

  // Before forwarding, strip out unnecessary params
  const {framed, ...query} = router.query;

  const stringifiedQuery = new URLSearchParams(
    query as Record<string, string>,
  ).toString();

  const iframeSrc = `/playroom/preview/?${stringifiedQuery}`;

  useEffect(() => {
    if (!frameRef?.current) {
      console.error(
        'Unable to create frame transport: iframe has not loaded in time',
      );
      return;
    }

    // Listen to events posted from the app frame
    const transport = fromFrame(
      {
        window: frameRef.current.contentWindow,
        // We listen in to window.top here because app-bridge posts all messages to
        // window.top (https://developer.mozilla.org/en-US/docs/Web/API/Window/top):
        // https://github.com/Shopify/app-bridge/blob/2689a2b754321e0fc243aa33c16c9e43c8fb5c52/packages/app-bridge/src/MessageTransport.ts#LL230C17-L230C17
        // Which is called from https://github.com/Shopify/app-bridge/blob/2689a2b754321e0fc243aa33c16c9e43c8fb5c52/packages/app-bridge/src/client/Client.ts#L266
        // NOTE: In Web Admint this works because window.top IS the host window.
        // But in our case, we've got another window above (the polaris docs
        // site), so window.top no longer matches to the host window. This may
        // or may not be intentional behaviour in App Bridge.
        host: window.top,
      },
      window.location.origin,
      Context.Main,
    );
    const detach = hostContext.app.attach(transport);
    return detach;
  }, [hostContext.app]);

  // DEBUG output
  useEffect(() => {
    const messageListener = (e: any) => console.log('received message', e.data);
    window.top!.addEventListener('message', messageListener);
    return () => window.top!.removeEventListener('message', messageListener);
  }, []);
  // End DEBUG output

  return (
    <GrowFrame
      ref={frameRef}
      id="app-iframe"
      style={{
        display: 'block',
        resize: 'horizontal',
        overflow: 'auto',
        width: '100%',
        maxWidth: '100%',
        minWidth: '375px',
      }}
      defaultHeight="400px"
      src={iframeSrc}
      onContentLoad={() => {
        updateGrowFrameHeight(`${document.body.scrollHeight}px`);
      }}
    />
  );
};

export default function AppEmulator() {
  const router = useRouter();

  const [isAdminFrameVisible, setAdminFrameVisible] = useState(
    !!router.query.framed,
  );

  useEffect(() => {
    if (router.isReady) {
      setAdminFrameVisible(!!router.query.framed);
    }
  }, [router.isReady, router.query?.framed]);

  // The parent window might instruct us to toggle the admin frame on or off
  useEffect(() => {
    const messageListener = (e: any) => {
      if (typeof e.data?.setFrameVisible !== 'undefined') {
        setAdminFrameVisible(!!e.data.setFrameVisible);
      }
    };
    window.addEventListener('message', messageListener);
    return () => window.removeEventListener('message', messageListener);
  }, []);

  useEffect(() => {
    // TODO: This doesn't work when contents shrink.
    updateGrowFrameHeight(`${document.body.scrollHeight}px`);
  }, [isAdminFrameVisible]);

  const frameProps = isAdminFrameVisible
    ? {
        logo: {
          width: 124,
          topBarSource:
            'https://cdn.shopify.com/s/files/1/0446/6937/files/jaded-pixel-logo-color.svg?6215648040070010999',
          contextualSaveBarSource:
            'https://cdn.shopify.com/s/files/1/0446/6937/files/jaded-pixel-logo-gray.svg?6215648040070010999',
          url: 'http://jadedpixel.com',
          accessibilityLabel: 'Jaded Pixel',
        },
        topBar: (
          <TopBar
            showNavigationToggle
            userMenu={
              <TopBar.UserMenu
                actions={[]}
                open={false}
                onToggle={() => {}}
                name="Dharma"
                initials="D"
              />
            }
            searchResultsVisible={false}
            searchField={null}
            searchResults={null}
          />
        ),
        navigation: (
          <Navigation location="/">
            <Navigation.Section
              items={[
                {
                  label: 'Home',
                  icon: HomeMajor,
                },
                {
                  label: 'Orders',
                  icon: OrdersMajor,
                },
              ]}
            />
            <Navigation.Section
              title="Apps"
              items={[
                {
                  label: 'My App',
                  icon: HomeMajor,
                },
              ]}
            />
          </Navigation>
        ),
        showMobileNavigation: false,
      }
    : {};

  // TODO: Tweak this to be more admin-like
  return (
    <AppProvider i18n={enTranslations}>
      <I18nContext.Provider value={I18N_MANAGER}>
        <Frame {...frameProps}>
          <Page
            fullWidth
            {...(isAdminFrameVisible ? {title: 'My App', divider: true} : {})}
          >
            <div
              style={
                isAdminFrameVisible
                  ? {
                      outline: '10px solid teal',
                      borderRadius: '1px',
                      marginBottom: '10px',
                    }
                  : {}
              }
            >
              <HostProvider
                config={config}
                components={[
                  AppBridgeLoading,
                  AppBridgeModal,
                  AppBridgeContextualSaveBar,
                  TheApp,
                ]}
                initialState={initialState}
              />
            </div>
          </Page>
        </Frame>
      </I18nContext.Provider>
    </AppProvider>
  );
}