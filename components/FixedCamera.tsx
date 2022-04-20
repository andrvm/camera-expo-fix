import { Camera, CameraProps } from 'expo-camera';
import { Dimensions, Platform } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * Types definition
 */
type StringNull = string | null;
type CameraNull = Camera | null;
type CommonJSONType = { [key: string]: number };

const FixedCamera = (props: CameraProps) => {

	const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
	const [camera, setCamera] = useState<CameraNull>(null);
	const [imagePadding, setImagePadding] = useState<number>(0);
	const [ratio, setRatio] = useState<string>('4:3');
	const { height, width } = Dimensions.get('window');
	const screenRatio: number = height / width;

	const ratioProcessing = (ratios: string[]): void => {

		const defaultRatio: string = '4:3';
		let realRatios: CommonJSONType = {};
		let minDistance: StringNull = null;

		ratios.forEach((ratio: string) => {

			const ratioParts = ratio.split(':');
			const realRatio: number = parseInt(ratioParts[0]) / parseInt(ratioParts[1]);

			realRatios[ratio] = realRatio;
			const distance: number = screenRatio - realRatio;

			if (minDistance === null) {
				minDistance = ratio;
			} else {
				if (minDistance && distance >= 0 && distance < realRatios[minDistance]) {
					minDistance = ratio;
				}
			}

		});

		//  calculate padding for best user's experience
		const padding: number = Math.floor((height - realRatios[defaultRatio] * width) / 2);
		// 	set the best match
		const desiredRatio: string = minDistance ? minDistance : defaultRatio;
		//
		setImagePadding(padding);
		setRatio(desiredRatio);

	}

	const ratioPreparing = async (): Promise<void> => {
		if (Platform.OS === 'android' && camera) {
			const ratios = await camera.getSupportedRatiosAsync();
			if (ratios.length > 0) {
				ratioProcessing(ratios);
			}
		}
	};

	useEffect(() => {
		if (isCameraReady) {
			ratioPreparing();
		}
	}, [screenRatio, isCameraReady]);


	return (
		<Camera
			{...props}
			style={[props.style, { marginTop: imagePadding, marginBottom: imagePadding }]}
			onCameraReady={() => setIsCameraReady(true)}
			ratio={ratio}
			ref={(ref) => setCamera(ref)}
		>
		</Camera>
	);
}

export default FixedCamera;
