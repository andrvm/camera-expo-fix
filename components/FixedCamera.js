import { Camera } from 'expo-camera';
import { Dimensions, Platform } from 'react-native';
import { useEffect, useState } from 'react';


export default function FixedCamera(props) {

	const [isCameraReady, setIsCameraReady] = useState(false);
	const [camera, setCamera] = useState(null);
	const [imagePadding, setImagePadding] = useState(0);
	const [ratio, setRatio] = useState('4:3');
	const { height, width } = Dimensions.get('window');
	const screenRatio = height / width;

	const prepareRatio = async () => {
		let desiredRatio = '4:3';
		if (Platform.OS === 'android') {
			const ratios = await camera.getSupportedRatiosAsync();
			let realRatios = {};
			let minDistance = null;
			// find the best match
			ratios.forEach(r => {
				const ratioParts = ratio.split(':');
				const realRatio = parseInt(ratioParts[0]) / parseInt(ratioParts[1]);
				realRatios[ratio] = realRatio;
				const distance = screenRatio - realRatio;
				if (minDistance === null) {
					minDistance = ratio;
				} else {
					if (distance >= 0 && distance < realRatios[minDistance]) {
						minDistance = ratio;
					}
				}
			});
			//  calculate padding for best user's experience
			const padding = Math.floor((height - realRatios[desiredRatio] * width) / 2);
			// 	set the best match
			desiredRatio = minDistance;
			//
			setImagePadding(padding);
			setRatio(desiredRatio);
		}
	};

	useEffect(() => {
		if (isCameraReady) {
			prepareRatio();
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
